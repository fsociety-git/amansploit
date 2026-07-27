import { NextRequest, NextResponse } from "next/server";
import {
  UnsafeTargetError,
  parseTarget,
  rateLimit,
  safeFetchHeaders,
} from "@/lib/safe-url";

export const runtime = "nodejs"; // needs node:dns for the SSRF guard

type Grade = "A+" | "A" | "B" | "C" | "D" | "F";

interface Check {
  key: string;
  name: string;
  present: boolean;
  value?: string;
  weight: number;
  note: string;
  fix: string;
}

function evaluate(h: Record<string, string>): { checks: Check[]; warnings: string[] } {
  const warnings: string[] = [];
  const get = (k: string) => h[k];

  const csp = get("content-security-policy");
  if (csp?.includes("'unsafe-inline'") && /script-src/.test(csp))
    warnings.push("CSP allows 'unsafe-inline' in script-src, which undermines most of its XSS protection.");
  if (csp?.includes("'unsafe-eval'"))
    warnings.push("CSP allows 'unsafe-eval'.");

  const hsts = get("strict-transport-security");
  if (hsts && !/max-age=\s*(\d+)/.test(hsts)) warnings.push("HSTS has no max-age.");
  const maxAge = hsts?.match(/max-age=\s*(\d+)/)?.[1];
  if (maxAge && Number(maxAge) < 15552000)
    warnings.push("HSTS max-age is under six months; browsers want at least 15552000.");

  const checks: Check[] = [
    {
      key: "content-security-policy",
      name: "Content-Security-Policy",
      weight: 25,
      note: "Controls what the browser is allowed to load and execute. The single strongest defence against XSS.",
      fix: "Start with default-src 'self' and add sources deliberately. Use a per-request nonce instead of 'unsafe-inline'.",
      present: !!csp,
      value: csp,
    },
    {
      key: "strict-transport-security",
      name: "Strict-Transport-Security",
      weight: 20,
      note: "Forces HTTPS for future visits, closing the downgrade window on first-click attacks.",
      fix: "max-age=63072000; includeSubDomains; preload",
      present: !!hsts,
      value: hsts,
    },
    {
      key: "x-content-type-options",
      name: "X-Content-Type-Options",
      weight: 15,
      note: "Stops the browser guessing content types, which can turn an upload into executable script.",
      fix: "nosniff",
      present: get("x-content-type-options")?.toLowerCase() === "nosniff",
      value: get("x-content-type-options"),
    },
    {
      key: "x-frame-options",
      name: "Frame protection",
      weight: 15,
      note: "Prevents your pages being embedded in someone else's site for clickjacking.",
      fix: "X-Frame-Options: DENY, or frame-ancestors 'none' in your CSP.",
      present:
        !!get("x-frame-options") || /frame-ancestors/.test(csp ?? ""),
      value: get("x-frame-options") ?? (csp?.match(/frame-ancestors[^;]*/)?.[0] || undefined),
    },
    {
      key: "referrer-policy",
      name: "Referrer-Policy",
      weight: 15,
      note: "Stops full URLs — often containing tokens or IDs — leaking to third parties.",
      fix: "strict-origin-when-cross-origin",
      present: !!get("referrer-policy"),
      value: get("referrer-policy"),
    },
    {
      key: "permissions-policy",
      name: "Permissions-Policy",
      weight: 10,
      note: "Switches off browser features you never use, shrinking the attack surface.",
      fix: "camera=(), microphone=(), geolocation=()",
      present: !!get("permissions-policy"),
      value: get("permissions-policy"),
    },
  ];

  // leaky server banners are worth calling out
  for (const k of ["server", "x-powered-by", "x-aspnet-version"]) {
    if (h[k]) warnings.push(`\`${k}: ${h[k]}\` reveals server details that help an attacker fingerprint you.`);
  }

  return { checks, warnings };
}

function grade(score: number, warnings: number): Grade {
  if (score >= 100 && warnings === 0) return "A+";
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 55) return "C";
  if (score >= 30) return "D";
  return "F";
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anon";
  if (!rateLimit(`hdr:${ip}`))
    return NextResponse.json({ error: "Too many scans. Try again in a minute." }, { status: 429 });

  let body: { target?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const url = parseTarget(String(body.target ?? ""));
    const res = await safeFetchHeaders(url);

    // A WAF/bot-protection challenge page carries none of the real site's
    // headers. Grading it would tell the visitor their site scores F when it
    // may be fine — worse than returning no answer at all.
    const BLOCKED = [401, 403, 405, 406, 429, 503];
    if (BLOCKED.includes(res.status)) {
      return NextResponse.json({
        blocked: true,
        target: res.finalUrl,
        status: res.status,
        error:
          `That host answered ${res.status} — its bot protection or firewall refused the check, ` +
          `so any grade would be measuring the block page rather than your site. ` +
          `Try again from a browser-based scanner, or allowlist this checker.`,
      }, { status: 200 });
    }
    const { checks, warnings } = evaluate(res.headers);
    const score = checks.reduce((n, c) => n + (c.present ? c.weight : 0), 0);

    return NextResponse.json({
      target: res.finalUrl,
      status: res.status,
      redirects: res.hops,
      score,
      grade: grade(score, warnings.length),
      checks,
      warnings,
    });
  } catch (e) {
    if (e instanceof UnsafeTargetError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    return NextResponse.json({ error: "Scan failed." }, { status: 500 });
  }
}
