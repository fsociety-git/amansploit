#!/usr/bin/env node
/**
 * Offline test for the autoposter's fail-closed behaviour.
 *
 * Stands up a fake model endpoint, feeds the generator a series of bad and good
 * responses, and asserts that only the good ones produce a file. Runs the whole
 * matrix twice — once shaped like GitHub Models (OpenAI-style `choices`) and
 * once shaped like Anthropic (`content`) — so both providers are covered.
 *
 *   node scripts/test-generate-post.mjs
 *
 * No API key, no network, no cost. Every case here corresponds to a way an
 * unreviewed post could embarrass you in public.
 */

import http from "node:http";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("./generate-post.mjs", import.meta.url));
const today = new Date().toISOString().slice(0, 10);

const filler = (s) => `${s} `.repeat(30);
const goodBody = `
## Why this happens

${filler("The mechanism is simple enough to state and awkward enough to get right.")}

## How to detect it

${filler("Detection depends on having the right field logged at the right layer.")}

## Designing it out

${filler("The durable fix is structural rather than a filter applied after the fact.")}

*The free tools at /tools will check this for you.*
`;

const post = (extra = "", body = goodBody) => `---
title: "A perfectly ordinary explainer about authorisation"
description: "What broken object level authorisation is and why frameworks do not fix it for you."
date: "2020-01-01"
tags: ["appsec", "authorisation"]
draft: true
---
${extra}${body}`;

/** Each `bad` string is spliced into an otherwise-valid post; all must be rejected. */
const INTEGRITY = [
  ["invented engagement", "I recently tested a payments platform and found this exact bug."],
  ["past-tense first-hand", "I have seen this pattern in production more times than I can count."],
  ["in my experience", "In my experience, teams get this wrong at the ORM layer."],
  ["claims a client", "A client asked me about this last month."],
  ["claims an engagement", "In a recent engagement the fix took twenty minutes."],
  ["dated anecdote", "Last month, I traced one of these back to a caching layer."],
  ["unverifiable CVE", "This is tracked as CVE-2024-31337 and was patched in 4.2.1."],
  ["cites a study", "According to a recent study, this is the most common web flaw."],
  ["invents a statistic", "Roughly 63% of organisations have this misconfigured right now."],
  ["cites a vendor report", "The Verizon DBIR puts this near the top every year."],
  ["asserts currency", "As of 2026 most frameworks still ship this default."],
  ["asserts a version", "The latest version of the library fixes it for you."],
  ["hype phrasing", "In today's digital landscape, authorisation is more important than ever."],
  ["ever-evolving", "The ever-evolving threat surface makes this harder."],
  ["emoji", "This one matters a lot 🔥 and people miss it."],
  ["placeholder", "[TODO] finish this section"],
  ["broke character", "As an AI language model, I should note the caveats here."],
];

const CASES = [
  { name: "http 500 (transient)", status: 500, text: "upstream boom", expect: "skip" },
  { name: "http 429 (rate limited)", status: 429, text: "slow down", expect: "skip" },
  { name: "http 404 (model retired)", status: 404, text: "unknown model", expect: "skip" },
  { name: "empty completion", body: "", expect: "skip" },
  { name: "no frontmatter", body: "## Just a heading\n" + goodBody, expect: "skip" },
  { name: "unclosed frontmatter", body: '---\ntitle: "x"\n' + goodBody, expect: "skip" },
  {
    name: "missing description",
    body: `---\ntitle: "Something"\ndate: "${today}"\n---\n${goodBody}`,
    expect: "skip",
  },
  { name: "too short", body: post("", "\nA paragraph and nothing else.\n"), expect: "skip" },
  ...INTEGRITY.map(([name, bad]) => ({ name, body: post(`\n${bad}\n`), expect: "skip" })),
  { name: "valid post", body: post(), expect: "write" },
];

// ── fake API, both response shapes ──────────────────────────────────────────
let current = CASES[0];
let shape = "openai";
const server = http.createServer((req, res) => {
  if (current.status) {
    res.writeHead(current.status, { "content-type": "text/plain" });
    return res.end(current.text ?? "error");
  }
  const payload =
    shape === "openai"
      ? { choices: [{ message: { content: current.body } }] }
      : { content: [{ type: "text", text: current.body }] };
  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify(payload));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const BASE = `http://127.0.0.1:${server.address().port}`;

const run = (env, cwd) =>
  new Promise((resolve) => {
    const p = spawn(process.execPath, [SCRIPT], {
      cwd,
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (out += d));
    p.on("close", (code) => resolve({ code, out }));
  });

const PROVIDERS = [
  {
    label: "github-models (free, default)",
    shape: "openai",
    env: {
      ANTHROPIC_API_KEY: "",
      GITHUB_TOKEN: "ghs_test",
      GITHUB_MODELS_BASE_URL: BASE,
      AUTOPOST_MODEL: "test/model",
      AUTOPOST_RETRY_MS: "10",
    },
  },
  {
    label: "anthropic (optional paid path)",
    shape: "anthropic",
    env: {
      ANTHROPIC_API_KEY: "sk-test",
      ANTHROPIC_BASE_URL: BASE,
      ANTHROPIC_MODEL: "test-model",
      AUTOPOST_RETRY_MS: "10",
    },
  },
];

let failures = 0;

for (const provider of PROVIDERS) {
  shape = provider.shape;
  console.log(`\n── ${provider.label} ${"─".repeat(Math.max(0, 46 - provider.label.length))}`);

  for (const c of CASES) {
    current = c;
    const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "autopost-"));
    await fs.mkdir(path.join(cwd, "content", "posts"), { recursive: true });

    const { code, out } = await run(provider.env, cwd);

    const written = (await fs.readdir(path.join(cwd, "content", "posts"))).filter((f) =>
      f.endsWith(".md"),
    );
    const actual = written.length ? "write" : "skip";

    if (actual !== c.expect || code !== 0) {
      failures++;
      console.log(`FAIL  ${c.name}\n      expected ${c.expect}, got ${actual} (exit ${code})\n${out}`);
      await fs.rm(cwd, { recursive: true, force: true });
      continue;
    }

    console.log(`ok    ${c.name.padEnd(26)} → ${actual}`);

    if (actual === "write") {
      // The script must overwrite what the model claimed: the fixture says
      // `draft: true` and a 2020 date, and neither may survive.
      const md = await fs.readFile(path.join(cwd, "content", "posts", written[0]), "utf8");
      const musts = [
        ["generated: true", true],
        ["draft: false", true],
        [`date: "${today}"`, true],
        ["draft: true", false],
        ['date: "2020-01-01"', false],
      ];
      for (const [needle, shouldExist] of musts) {
        if (md.includes(needle) !== shouldExist) {
          failures++;
          console.log(`FAIL  written post ${shouldExist ? "is missing" : "still contains"} \`${needle}\``);
        }
      }
      console.log(`      → ${written[0]}`);
    }
    await fs.rm(cwd, { recursive: true, force: true });
  }
}

// ── no credentials at all must fail loudly, not silently ────────────────────
{
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "autopost-"));
  await fs.mkdir(path.join(cwd, "content", "posts"), { recursive: true });
  const { code } = await run({ ANTHROPIC_API_KEY: "", GITHUB_TOKEN: "" }, cwd);
  if (code === 0) {
    failures++;
    console.log("\nFAIL  missing credentials exited 0 — a misconfigured repo would fail silently");
  } else {
    console.log("\nok    no credentials              → exits 1 (loud)");
  }
  await fs.rm(cwd, { recursive: true, force: true });
}

server.close();
console.log(failures ? `\n${failures} failure(s)` : "\nAll cases passed.");
process.exit(failures ? 1 : 0);
