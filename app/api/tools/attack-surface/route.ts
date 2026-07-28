import dns from "node:dns/promises";
import { NextRequest, NextResponse } from "next/server";
import { UnsafeTargetError, rateLimit } from "@/lib/safe-url";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * What the internet can see.
 *
 * Reads public certificate transparency logs for every hostname ever issued a
 * certificate under a domain, then resolves each one to see which are still
 * alive today. Nothing is connected to, nothing is probed, no ports are
 * touched — this is a public-record lookup plus DNS, and it is exactly what an
 * attacker does first because it costs them nothing either.
 *
 * The output people find uncomfortable is the middle column: hosts they had
 * forgotten existed, still resolving, still serving something.
 *
 * Two honesty rules carried over from the other tools:
 *  · A DNS failure is not the same as "does not resolve". Timeouts are counted
 *    separately rather than reported as dead, because telling someone a live
 *    host is gone is worse than saying nothing.
 *  · CT logs record certificates, not reality. A name here may never have been
 *    deployed, and a host with no certificate never appears at all. The
 *    response says so and the UI repeats it.
 */

// Overridable so the parsing path can be tested offline; crt.sh is not
// reachable from every build environment and an untested parser is worse than
// an untested transport.
const CRT_SH = process.env.CRT_SH_BASE || "https://crt.sh";
const MAX_RESOLVE = 60; // DNS lookups per request — keeps us inside maxDuration

/** Names that are worth a second look when they turn up in someone's estate. */
const INTERESTING = [
  { re: /^(dev|test|staging|stage|uat|qa|sandbox|demo|preprod|pre-prod)\b/, why: "Non-production environment, often with weaker controls and real data" },
  { re: /\b(admin|manage|portal|console|dashboard|panel|cpanel|webmail)\b/, why: "Administrative interface exposed to the internet" },
  { re: /\b(vpn|remote|rdp|ssh|bastion|jump)\b/, why: "Remote access endpoint — worth confirming MFA is enforced" },
  { re: /\b(jenkins|gitlab|git|jira|confluence|sonar|nexus|artifactory|grafana|kibana|prometheus)\b/, why: "Internal tooling, frequently deployed with default credentials" },
  { re: /\b(api|graphql|gateway)\b/, why: "API surface — the place authorisation flaws usually live" },
  { re: /\b(backup|old|legacy|archive|deprecated|temp|tmp)\b/, why: "Name suggests it was meant to be decommissioned" },
  { re: /\b(db|database|mysql|postgres|mongo|redis|elastic)\b/, why: "Data store hostname should rarely be publicly resolvable" },
  { re: /\b(mail|smtp|imap|mx)\b/, why: "Mail infrastructure — check it isn't an open relay" },
];

function cleanDomain(input: string): string {
  let d = input.trim().toLowerCase();
  if (d.includes("@")) d = d.split("@").pop()!;
  d = d.replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
  if (d.startsWith("*.")) d = d.slice(2);
  if (!d || d.length > 253 || !d.includes(".") || /[^a-z0-9.\-]/.test(d))
    throw new UnsafeTargetError("Enter a domain like example.com.");
  // A bare IP is not a domain and has no certificate-transparency history.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(d))
    throw new UnsafeTargetError("Enter a domain name, not an IP address.");
  return d;
}

interface CrtRow {
  name_value?: string;
  not_after?: string;
  issuer_name?: string;
}

async function fetchCt(domain: string): Promise<{ rows: CrtRow[]; failed: boolean }> {
  // The domain is validated to [a-z0-9.-] above, so it cannot break out of the
  // query parameter. Fixed host, so no SSRF surface here.
  const url = `${CRT_SH}/?q=${encodeURIComponent("%." + domain)}&output=json&exclude=expired`;
  try {
    const res = await fetch(url, {
      headers: { accept: "application/json", "user-agent": "amansploit.com attack-surface tool" },
      signal: AbortSignal.timeout(18_000),
      cache: "no-store",
    });
    if (!res.ok) return { rows: [], failed: true };
    const json = await res.json();
    return { rows: Array.isArray(json) ? json : [], failed: false };
  } catch {
    return { rows: [], failed: true };
  }
}

type Liveness = "live" | "dead" | "unknown";

async function resolves(host: string): Promise<{ state: Liveness; addr?: string }> {
  try {
    const a = await dns.resolve4(host);
    return { state: "live", addr: a[0] };
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code ?? "";
    if (code === "ENOTFOUND" || code === "ENODATA") {
      // No A record. Could still be IPv6-only, so check before calling it dead.
      try {
        const a6 = await dns.resolve6(host);
        return { state: "live", addr: a6[0] };
      } catch (e6) {
        const c6 = (e6 as NodeJS.ErrnoException).code ?? "";
        return { state: c6 === "ENOTFOUND" || c6 === "ENODATA" ? "dead" : "unknown" };
      }
    }
    return { state: "unknown" };
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anon";
  // Lower ceiling than the other tools: each call fans out to dozens of lookups.
  if (!rateLimit(`surface:${ip}`, 5))
    return NextResponse.json({ error: "Too many checks. Try again in a minute." }, { status: 429 });

  let body: { target?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const domain = cleanDomain(String(body.target ?? ""));
    const ct = await fetchCt(domain);

    if (ct.failed) {
      return NextResponse.json({
        domain,
        inconclusive: true,
        headline:
          "The certificate transparency logs didn't answer in time. That is a problem at their end, not a finding about your domain — try again in a moment.",
        names: [],
      });
    }

    // One certificate can carry many names, and names repeat across renewals.
    const seen = new Set<string>();
    for (const row of ct.rows) {
      for (const raw of String(row.name_value ?? "").split("\n")) {
        const n = raw.trim().toLowerCase().replace(/^\*\./, "");
        if (!n || n === domain) continue;
        if (!n.endsWith(`.${domain}`)) continue; // ignore unrelated SANs
        if (/[^a-z0-9.\-]/.test(n)) continue;
        seen.add(n);
      }
    }

    const all = [...seen].sort();
    const checked = all.slice(0, MAX_RESOLVE);

    const results = await Promise.all(
      checked.map(async (host) => {
        const r = await resolves(host);
        const label = host.slice(0, -(domain.length + 1));
        const flag = INTERESTING.find((i) => i.re.test(label));
        return { host, ...r, note: flag?.why };
      }),
    );

    const live = results.filter((r) => r.state === "live");
    const notable = live.filter((r) => r.note);

    const headline = !all.length
      ? `No subdomain certificates found for ${domain} in the public logs. Either the estate is genuinely small, or its hosts use certificates that don't log — which is itself worth knowing.`
      : notable.length
        ? `${all.length} hostnames have been issued certificates under ${domain}. ${live.length} of the ${checked.length} checked still resolve, and ${notable.length} look worth a closer look.`
        : `${all.length} hostnames have been issued certificates under ${domain}, and ${live.length} of the ${checked.length} checked still resolve today.`;

    return NextResponse.json({
      domain,
      headline,
      totalNames: all.length,
      checkedCount: checked.length,
      truncated: all.length > MAX_RESOLVE,
      liveCount: live.length,
      deadCount: results.filter((r) => r.state === "dead").length,
      unknownCount: results.filter((r) => r.state === "unknown").length,
      notableCount: notable.length,
      results,
    });
  } catch (e) {
    if (e instanceof UnsafeTargetError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    return NextResponse.json({ error: "Could not complete that check." }, { status: 500 });
  }
}
