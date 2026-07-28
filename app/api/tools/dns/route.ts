import dns from "node:dns/promises";
import { NextRequest, NextResponse } from "next/server";
import { UnsafeTargetError, rateLimit } from "@/lib/safe-url";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * DNS hygiene.
 *
 * Everything here is a public DNS lookup — the same queries any resolver on the
 * internet makes on your behalf a thousand times a day. Nothing is connected
 * to and nothing is scanned.
 *
 * DNSSEC needs a resolver that validates and reports the AD flag, which Node's
 * `dns` module does not expose, so those two checks go over DNS-over-HTTPS to a
 * public validating resolver instead. If that resolver is unreachable the
 * result is reported as inconclusive rather than as "no DNSSEC" — the same rule
 * the email tool uses, and for the same reason: a false negative here would
 * tell someone their domain is unprotected when it may be fine.
 *
 * Dangling-record detection is deliberately narrow. It reports a CNAME whose
 * target does not resolve, which is the precondition for subdomain takeover. It
 * does NOT claim a takeover is possible — that depends on whether the provider
 * allows unclaimed names, which changes constantly and cannot be established
 * from DNS alone.
 */

const DOH = "https://dns.google/resolve";

/** Names worth probing on any domain — cheap, and where dangling records live. */
const COMMON = [
  "www", "mail", "blog", "shop", "app", "api", "dev", "staging", "test",
  "admin", "portal", "docs", "status", "cdn", "assets", "img", "static",
];

function cleanDomain(input: string): string {
  let d = input.trim().toLowerCase();
  if (d.includes("@")) d = d.split("@").pop()!;
  d = d.replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
  if (!d || d.length > 253 || !d.includes(".") || /[^a-z0-9.\-]/.test(d))
    throw new UnsafeTargetError("Enter a domain like example.com.");
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(d))
    throw new UnsafeTargetError("Enter a domain name, not an IP address.");
  return d;
}

/** DNS-over-HTTPS, used only where Node's resolver can't answer the question. */
async function doh(name: string, type: string) {
  try {
    const res = await fetch(`${DOH}?name=${encodeURIComponent(name)}&type=${type}`, {
      headers: { accept: "application/dns-json" },
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });
    if (!res.ok) return { failed: true, ad: false, answers: [] as { data?: string }[] };
    const j = await res.json();
    return { failed: false, ad: Boolean(j.AD), answers: (j.Answer ?? []) as { data?: string }[] };
  } catch {
    return { failed: true, ad: false, answers: [] as { data?: string }[] };
  }
}

type State = "pass" | "warn" | "fail" | "unknown";
interface Check {
  key: string;
  name: string;
  state: State;
  detail: string;
  fix?: string;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anon";
  if (!rateLimit(`dns:${ip}`, 6))
    return NextResponse.json({ error: "Too many checks. Try again in a minute." }, { status: 429 });

  let body: { target?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const domain = cleanDomain(String(body.target ?? ""));
    const checks: Check[] = [];

    const [ns, caa, mx, soa, ds, dnskey, wildcard] = await Promise.all([
      dns.resolveNs(domain).catch(() => [] as string[]),
      dns.resolveCaa(domain).catch(() => [] as { issue?: string; issuewild?: string; iodef?: string }[]),
      dns.resolveMx(domain).catch(() => [] as { exchange: string; priority: number }[]),
      dns.resolveSoa(domain).catch(() => null),
      doh(domain, "DS"),
      doh(domain, "DNSKEY"),
      // A wildcard answers for a name nobody would ever register.
      dns.resolve4(`zz-no-such-host-${Math.abs(domain.length * 7919)}.${domain}`).catch(() => null),
    ]);

    // ── nameservers ────────────────────────────────────────────────────────
    if (!ns.length) {
      checks.push({ key: "ns", name: "Nameservers", state: "unknown", detail: "Could not read NS records." });
    } else {
      const suffixes = new Set(ns.map((n) => n.split(".").slice(-2).join(".")));
      checks.push({
        key: "ns",
        name: "Nameservers",
        state: ns.length < 2 ? "fail" : suffixes.size < 2 ? "warn" : "pass",
        detail:
          ns.length < 2
            ? `Only one nameserver (${ns[0]}). A single nameserver is a single point of failure for the entire domain.`
            : `${ns.length} nameservers: ${ns.join(", ")}.${suffixes.size < 2 ? " All on one provider — resilient to a server failure, not to a provider outage." : ""}`,
        fix: ns.length < 2 ? "Add at least a second nameserver, ideally on separate infrastructure." : undefined,
      });
    }

    // ── CAA ────────────────────────────────────────────────────────────────
    checks.push({
      key: "caa",
      name: "CAA",
      state: caa.length ? "pass" : "warn",
      detail: caa.length
        ? `${caa.length} CAA record${caa.length > 1 ? "s" : ""} published — only the named authorities may issue for this domain.`
        : "No CAA record. Any certificate authority in the world is permitted to issue a certificate for this domain, and you would only find out from the transparency logs.",
      fix: caa.length ? undefined : `${domain}  CAA  0 issue "letsencrypt.org"`,
    });

    // ── DNSSEC ─────────────────────────────────────────────────────────────
    if (ds.failed || dnskey.failed) {
      checks.push({
        key: "dnssec",
        name: "DNSSEC",
        state: "unknown",
        detail: "The validating resolver did not answer. Not reported as absent, because a timeout is not evidence.",
      });
    } else {
      const signed = ds.answers.length > 0 && dnskey.answers.length > 0;
      checks.push({
        key: "dnssec",
        name: "DNSSEC",
        state: signed ? "pass" : "warn",
        detail: signed
          ? `Signed — ${ds.answers.length} DS record${ds.answers.length > 1 ? "s" : ""} in the parent zone and a published DNSKEY. Responses can be verified as authentic.`
          : "Not signed. DNS answers for this domain cannot be cryptographically verified, so a resolver has no way to detect a forged response.",
        fix: signed ? undefined : "Enable DNSSEC at your DNS provider, then publish the DS record at your registrar. Order matters — DS last.",
      });
    }

    // ── wildcard ───────────────────────────────────────────────────────────
    checks.push({
      key: "wildcard",
      name: "Wildcard record",
      state: wildcard ? "warn" : "pass",
      detail: wildcard
        ? `A wildcard is answering — a hostname nobody has ever registered resolved to ${wildcard[0]}. That makes it impossible to tell which subdomains genuinely exist, and it hands an attacker a valid-looking hostname on your domain for phishing.`
        : "No wildcard record. Only names you have actually created resolve.",
    });

    // ── mail ───────────────────────────────────────────────────────────────
    const nullMx = mx.length === 1 && (mx[0].exchange === "" || mx[0].exchange === ".");
    checks.push({
      key: "mx",
      name: "Mail records",
      state: mx.length || nullMx ? "pass" : "warn",
      detail: nullMx
        ? "A null MX is published — this domain explicitly declares that it accepts no mail, which is exactly right for a domain that doesn't."
        : mx.length
          ? `${mx.length} MX record${mx.length > 1 ? "s" : ""}: ${mx.map((m) => m.exchange).join(", ")}.`
          : "No MX records and no null MX. The domain neither receives mail nor declares that it doesn't — publishing a null MX removes the ambiguity.",
      fix: !mx.length && !nullMx ? `${domain}  MX  0 .` : undefined,
    });

    // ── SOA sanity ─────────────────────────────────────────────────────────
    if (soa) {
      const longExpire = soa.expire > 4_838_400; // > 8 weeks
      checks.push({
        key: "soa",
        name: "SOA",
        state: "pass",
        detail: `Primary ${soa.nsname}, refresh ${soa.refresh}s, retry ${soa.retry}s, expire ${soa.expire}s, minimum TTL ${soa.minttl}s.${longExpire ? " The expire value is unusually long — secondaries would keep serving stale data for weeks if the primary vanished." : ""}`,
      });
    }

    // ── dangling CNAMEs ────────────────────────────────────────────────────
    const dangling: { host: string; target: string }[] = [];
    await Promise.all(
      COMMON.map(async (label) => {
        const host = `${label}.${domain}`;
        try {
          const target = (await dns.resolveCname(host))[0];
          if (!target) return;
          try {
            await dns.resolve4(target);
          } catch (e) {
            const code = (e as NodeJS.ErrnoException).code ?? "";
            // Only NXDOMAIN is evidence. A timeout proves nothing.
            if (code === "ENOTFOUND") dangling.push({ host, target });
          }
        } catch {
          /* no CNAME here — fine */
        }
      }),
    );

    checks.push({
      key: "dangling",
      name: "Dangling records",
      state: dangling.length ? "fail" : "pass",
      detail: dangling.length
        ? `${dangling.length} CNAME${dangling.length > 1 ? "s point" : " points"} at a target that no longer exists: ${dangling.map((d) => `${d.host} → ${d.target}`).join(", ")}. Whether this is takeable depends on the provider, but it is the precondition for subdomain takeover and there is no reason to leave it.`
        : `None of the ${COMMON.length} common names checked have a CNAME pointing somewhere dead.`,
      fix: dangling.length ? "Delete the CNAME records whose targets are gone." : undefined,
    });

    const fails = checks.filter((c) => c.state === "fail").length;
    const warns = checks.filter((c) => c.state === "warn").length;

    return NextResponse.json({
      domain,
      checks,
      failCount: fails,
      warnCount: warns,
      grade: fails ? "needs work" : warns > 2 ? "could be tighter" : warns ? "good" : "clean",
      headline: fails
        ? `${fails} thing${fails > 1 ? "s need" : " needs"} attention on ${domain}, and ${warns} more could be tightened.`
        : warns
          ? `Nothing broken on ${domain}, but ${warns} thing${warns > 1 ? "s are" : " is"} worth tightening.`
          : `${domain} looks well configured. Nothing here needs changing.`,
      checkedNames: COMMON.length,
    });
  } catch (e) {
    if (e instanceof UnsafeTargetError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    return NextResponse.json({ error: "Could not complete that check." }, { status: 500 });
  }
}
