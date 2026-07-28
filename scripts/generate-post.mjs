#!/usr/bin/env node
/**
 * Autonomous post generator.
 *
 * Runs from GitHub Actions on a schedule, writes one post into content/posts,
 * and lets the workflow commit it. Vercel redeploys on push.
 *
 * PROVIDERS
 * ---------
 * Default is GitHub Models, which costs nothing and needs no secret: Actions
 * already hands every workflow run a GITHUB_TOKEN, and adding `models: read`
 * to the workflow's permissions block is enough to call it. Free-tier limits
 * are far above one post a day.
 *
 * If ANTHROPIC_API_KEY is ever set as a repository secret, the script uses
 * Claude instead without any other change. That is the only difference between
 * the free path and the paid one.
 *
 * DESIGN RULES, because this publishes without review on a site whose product
 * is expertise:
 *
 *  · FAIL CLOSED. Any doubt — API error, short output, malformed frontmatter,
 *    duplicate topic — exits without writing. Publishing nothing is always
 *    better than publishing something wrong under your name.
 *  · NO CLAIMED EXPERIENCE. The model must not invent engagements, clients,
 *    CTF solves, or "I found this in a recent test". It writes explainers, not
 *    war stories it did not live.
 *  · NO NAMED-COMPANY VULNERABILITIES. Never claim a specific real company is
 *    or was vulnerable.
 *  · NO UNVERIFIABLE FACTS. It has no browser and a training cutoff, so it is
 *    told to write evergreen explanations rather than assert recent events,
 *    versions, CVE details or statistics it cannot check.
 *  · DISCLOSED. The frontmatter is rebuilt by this script, not trusted from the
 *    model, so `generated: true` cannot be lost to a formatting slip. The post
 *    page renders that as a visible note.
 */

import fs from "node:fs/promises";
import path from "node:path";

const DIR = path.join(process.cwd(), "content", "posts");

const die = (msg) => {
  console.error(`[autopost] ${msg}`);
  process.exit(1);
};
const skip = (msg) => {
  console.log(`[autopost] skipping: ${msg}`);
  process.exit(0); // exit 0 so the workflow succeeds without committing
};

// ── provider selection ──────────────────────────────────────────────────────
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

/**
 * Model order matters. The first that answers wins; a 400/404 (model retired or
 * not in this account's catalogue) falls through to the next rather than
 * killing the run. Free catalogues change without notice, so never depend on
 * exactly one name.
 */
const PROVIDER = ANTHROPIC_KEY
  ? {
      name: "anthropic",
      base: process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com",
      pathname: "/v1/messages",
      models: [process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5"],
      headers: { "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
      body: (model, system, user) => ({
        model,
        max_tokens: 4000,
        system,
        messages: [{ role: "user", content: user }],
      }),
      read: (json) => json.content?.map((c) => c.text ?? "").join("").trim(),
    }
  : {
      name: "github-models",
      base: process.env.GITHUB_MODELS_BASE_URL || "https://models.github.ai",
      pathname: "/inference/chat/completions",
      models: (process.env.AUTOPOST_MODEL || "openai/gpt-4.1,openai/gpt-4o,meta/Llama-3.3-70B-Instruct")
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean),
      headers: { authorization: `Bearer ${GITHUB_TOKEN}` },
      body: (model, system, user) => ({
        model,
        max_tokens: 4000,
        temperature: 0.7,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      read: (json) => json.choices?.[0]?.message?.content?.trim(),
    };

if (PROVIDER.name === "github-models" && !GITHUB_TOKEN) {
  die(
    "No credentials. Either run inside GitHub Actions with `permissions: models: read` " +
      "(GITHUB_TOKEN is provided automatically), or set ANTHROPIC_API_KEY.",
  );
}

// ── topic rotation ──────────────────────────────────────────────────────────
const AREAS = [
  {
    id: "buyer",
    brief:
      "Buyer education for people purchasing security work: how to scope an engagement, what a deliverable should contain, how to tell a real assessment from a scan, what compliance frameworks actually require versus what vendors imply.",
  },
  {
    id: "technical",
    brief:
      "A technical deep-dive explaining a vulnerability class or defensive technique from first principles: why it exists, how it is exploited conceptually, how to detect it, and how to design it out. Depth over breadth.",
  },
  {
    id: "detection",
    brief:
      "Detection and security engineering: log pipeline design, what makes an alert actionable, monitoring failure modes, how to build tooling that a small team can actually run.",
  },
  {
    id: "methodology",
    brief:
      "Testing methodology explained through a technique rather than a specific machine: how to approach enumeration, privilege escalation, or authorisation testing, and the reasoning behind the steps.",
  },
];

const area = AREAS[new Date().getUTCDay() % AREAS.length];

// ── avoid repeating ourselves ───────────────────────────────────────────────
let existing = [];
try {
  const files = (await fs.readdir(DIR)).filter((f) => f.endsWith(".md"));
  existing = await Promise.all(
    files.map(async (f) => {
      const raw = await fs.readFile(path.join(DIR, f), "utf8");
      return (raw.match(/^title:\s*"?(.+?)"?\s*$/m)?.[1] ?? f).trim();
    }),
  );
} catch {
  await fs.mkdir(DIR, { recursive: true });
}

const today = new Date().toISOString().slice(0, 10);

const SYSTEM = `You write for amansploit.com, the site of Aman Sonkamble — a security analyst and independent security engineer (penetration testing, security automation, secure development).

VOICE
- First person, plain, direct. Short sentences. British spelling.
- Explain mechanisms, not vibes. Assume a smart reader who is not a specialist.
- No hype. Never write "in today's digital landscape", "ever-evolving", "delve", "robust", "leverage", "game-changer", or "it is worth noting". No emoji. No bullet-point soup.
- It is fine to say when something is uncertain or when a reader does not need a consultant.

HARD RULES — violating any of these makes the post unusable and it will be discarded:
1. Never invent client engagements, findings, CTF solves, war stories, or personal anecdotes. You did not do the work. Write explanation, not experience. Do not write "I tested", "I found", "in my experience", "I have seen", "a client of mine".
2. Never state or imply that a named real company is or was vulnerable.
3. Never assert recent events, breach details, CVE numbers, product version numbers, dates, or statistics. You have no browser and a training cutoff. Write evergreen mechanics instead. If a fact would need checking, leave it out.
4. No fabricated quotes, benchmarks, percentages, survey results, or citations to reports and studies. Do not write "a recent study found" or "X% of organisations". If you cannot name it from memory with certainty, do not gesture at it.
5. Do not claim the author holds credentials or experience beyond: security analyst, freelance security engineer, CEH Master, CompTIA Security+, CND, ECSS, top 1% TryHackMe.

Generic illustrative examples are fine and encouraged — "imagine an order API that filters after fetching" — as long as they are clearly hypothetical and not presented as something that happened.

FORMAT
Titles and headings use SENTENCE CASE, not Title Case. Write "What makes a security alert actionable", never "What Makes a Security Alert Actionable". Only proper nouns and acronyms keep their capitals. This matches the rest of the site and Title Case immediately looks machine-written next to it.

Return ONLY a markdown document, no preamble and no code fence around the whole thing. Begin with YAML frontmatter exactly like:
---
title: "..."
description: "One or two sentences."
date: "${today}"
tags: ["...", "..."]
draft: false
generated: true
---

Then the body: 700–1100 words, ## and ### headings, fenced code blocks where they genuinely help. End with a short italic line offering the free tools at /tools or the estimator at /#estimate — never a hard sell.`;

const USER = `Write today's post.

Topic area: ${area.brief}

Already published — pick a clearly different subject:
${existing.map((t) => `- ${t}`).join("\n") || "- (nothing yet)"}

Choose one specific, useful angle and go deep on it. Return only the markdown document.`;

// ── generate ────────────────────────────────────────────────────────────────
/**
 * Three failure modes, deliberately treated differently:
 *
 *  · Transient (network, 429, 5xx)   → retry, then skip. Tomorrow picks it up.
 *  · Unknown model (400, 404, 422)   → try the next model in the list.
 *  · Configuration (401, 403)        → die loudly. A bad token does not heal on
 *    its own, and a silent skip would mean the blog quietly stops publishing
 *    for months without anyone noticing.
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Backoff base, in ms. Overridable so the offline test suite does not spend a
// real minute sleeping through the retry cases.
const BACKOFF = Number(process.env.AUTOPOST_RETRY_MS) || 10_000;

async function callModel(model) {
  const res = await fetch(`${PROVIDER.base}${PROVIDER.pathname}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...PROVIDER.headers },
    body: JSON.stringify(PROVIDER.body(model, SYSTEM, USER)),
    signal: AbortSignal.timeout(180_000),
  });
  return res;
}

async function generate() {
  for (const model of PROVIDER.models) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      let res;
      try {
        res = await callModel(model);
      } catch (e) {
        console.log(`[autopost] ${model} attempt ${attempt} network error: ${e.message}`);
        if (attempt === 3) break;
        await sleep(attempt * (BACKOFF / 2));
        continue;
      }

      if (res.ok) {
        const json = await res.json();
        const text = PROVIDER.read(json);
        if (text) {
          console.log(`[autopost] generated with ${PROVIDER.name}:${model}`);
          return text;
        }
        console.log(`[autopost] ${model} returned an empty completion`);
        break; // no point retrying an empty but successful response
      }

      const detail = (await res.text()).slice(0, 300);

      if (res.status === 401 || res.status === 403) {
        die(
          `API returned ${res.status} for ${PROVIDER.name}. ` +
            (PROVIDER.name === "github-models"
              ? "Check that the workflow has `permissions: models: read`."
              : "Check ANTHROPIC_API_KEY.") +
            ` ${detail}`,
        );
      }

      if ([400, 404, 422].includes(res.status)) {
        console.log(`[autopost] ${model} unavailable (${res.status}), trying the next model`);
        break; // fall through to the next model
      }

      console.log(`[autopost] ${model} attempt ${attempt} got ${res.status}: ${detail}`);
      if (attempt === 3) break;
      await sleep(attempt * BACKOFF);
    }
  }
  skip("no model produced a completion");
}

const text = await generate();

// ── validate, fail closed ───────────────────────────────────────────────────
if (!text || text.length < 1200) skip("output too short");
if (!text.startsWith("---")) skip("no frontmatter");

const close = text.indexOf("\n---", 3);
if (close === -1) skip("frontmatter never closes");

const fm = text.slice(3, close);
const title = fm.match(/title:\s*"(.+?)"/)?.[1];
const desc = fm.match(/description:\s*"(.+?)"/)?.[1];
if (!title || !desc) skip("frontmatter missing title or description");

const body = text.slice(close + 4);
if (body.split(/\s+/).length < 450) skip("body too short");

/**
 * Integrity checks. These are the load-bearing part of the whole system: they
 * are what makes it acceptable to publish unreviewed. Each one corresponds to a
 * specific way an unreviewed post could do real damage — claiming work that was
 * never done, naming a company as vulnerable, or citing a statistic that does
 * not exist. A free model needs these more than an expensive one does.
 *
 * Checked against the title too, not just the body.
 */
const checked = `${title}\n${desc}\n${body}`;

const banned = [
  // fabricated first-hand experience
  [/\bI (?:recently |once |just )?(?:tested|assessed|audited|pentested|reviewed|found|discovered|exploited)\b/i, "claims first-hand work"],
  [/\bI(?:'ve| have) (?:seen|tested|audited|worked with|come across|encountered)\b/i, "claims first-hand work"],
  [/\bin (?:my|our) experience\b/i, "claims first-hand work"],
  [/\b(?:a|one|my) client(?:'s)?\b/i, "claims a client"],
  [/\bin a (?:recent |previous )?(?:engagement|assessment|pentest)\b/i, "claims an engagement"],
  [/\blast (?:week|month|year|quarter),? I\b/i, "claims a dated anecdote"],
  [/\bwhen I was (?:testing|working|assessing)\b/i, "claims first-hand work"],

  // unverifiable specifics
  [/\bCVE-\d{4}-\d+/, "cites a CVE it cannot verify"],
  [/\baccording to (?:a |the )?(?:recent )?(?:study|report|survey|research)\b/i, "cites an unverifiable study"],
  [/\b\d{1,3}(?:\.\d+)?\s?%\s+of\s+(?:companies|organisations|organizations|businesses|breaches|attacks|websites|developers)\b/i, "invents a statistic"],
  [/\b(?:Gartner|Forrester|Ponemon|Verizon DBIR|DBIR|IBM Cost of a Data Breach)\b/i, "cites a report it cannot verify"],
  [/\bas of (?:20\d{2}|today|this year)\b/i, "asserts currency it cannot verify"],
  [/\bthe (?:latest|newest|most recent) version\b/i, "asserts a version it cannot verify"],

  // slop tells — these read as machine-written and cost credibility on a site selling expertise
  [/\bin today's (?:digital |threat |security )?(?:landscape|world|age)\b/i, "hype phrasing"],
  [/\bever[- ]evolving\b/i, "hype phrasing"],
  [/\b(?:delve|delving) into\b/i, "hype phrasing"],
  [/\bgame[- ]changer\b/i, "hype phrasing"],
  [/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u, "contains emoji"],

  // mechanical failures
  [/\blorem ipsum\b/i, "placeholder text"],
  [/\[TODO\]|\[placeholder\]|\[insert\b/i, "placeholder text"],
  [/\bAs an AI\b/i, "model broke character"],
];

for (const [re, why] of banned) {
  if (re.test(checked)) skip(`integrity check failed — ${why} (${re})`);
}

const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, "")
  .trim()
  .replace(/\s+/g, "-")
  .slice(0, 70)
  .replace(/-+$/, "");
if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) skip("could not derive a clean slug");

const file = path.join(DIR, `${slug}.md`);
try {
  await fs.access(file);
  skip("a post with that slug already exists");
} catch {
  /* good — it does not exist */
}

/**
 * Rebuild the frontmatter rather than trusting it. The model controls title,
 * description and tags; the script controls date, draft and — critically —
 * `generated: true`. Disclosure must not be something a formatting slip can
 * silently drop.
 */
const tags = fm.match(/tags:\s*(\[.*?\])/s)?.[1] ?? '["security"]';
const front = [
  "---",
  `title: "${title.replace(/"/g, "'")}"`,
  `description: "${desc.replace(/"/g, "'")}"`,
  `date: "${today}"`,
  `tags: ${tags.replace(/\s+/g, " ").trim()}`,
  "draft: false",
  "generated: true",
  "---",
  "",
].join("\n");

const out = front + body.trimStart().replace(/\n*$/, "\n");
await fs.writeFile(file, out, "utf8");
console.log(`[autopost] wrote content/posts/${slug}.md — "${title}"`);

// Hand the slug to the workflow for the commit message. The title is model
// output being handed to a shell, so strip everything that is not plain text —
// backticks, $, quotes and newlines never reach the runner.
if (process.env.GITHUB_OUTPUT) {
  const safeTitle = title.replace(/[^\w\s.,:'’—-]/g, "").slice(0, 90).trim();
  await fs.appendFile(
    process.env.GITHUB_OUTPUT,
    `slug=${slug}\ntitle=${safeTitle}\nwrote=1\n`,
  );
}
