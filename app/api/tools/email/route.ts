import dns from "node:dns/promises";
import { NextRequest, NextResponse } from "next/server";
import { UnsafeTargetError, rateLimit } from "@/lib/safe-url";

export const runtime = "nodejs";

/** Selectors worth probing. DKIM selectors cannot be enumerated from DNS. */
const DKIM_SELECTORS = [
  "default", "google", "selector1", "selector2", "k1", "k2",
  "dkim", "mail", "smtp", "s1", "s2", "zoho", "mandrill", "sendgrid", "mailjet",
];

function cleanDomain(input: string): string {
  let d = input.trim().toLowerCase();
  if (d.includes("@")) d = d.split("@").pop()!;
  d = d.replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
  if (!d || d.length > 253 || !d.includes(".") || /[^a-z0-9.\-]/.test(d))
    throw new UnsafeTargetError("Enter a domain like example.com.");
  return d;
}

/**
 * A DNS failure is NOT the same as "no record". Reporting a timeout as a
 * missing SPF record would tell a visitor their domain is spoofable when it may
 * be perfectly configured — the most damaging thing this tool could get wrong.
 */
async function txt(name: string): Promise<{ records: string[]; failed: boolean }> {
  try {
    return { records: (await dns.resolveTxt(name)).map((r) => r.join("")), failed: false };
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code ?? "";
    // definitive answers: the name exists with no TXT, or does not exist
    if (code === "ENODATA" || code === "ENOTFOUND") return { records: [], failed: false };
    return { records: [], failed: true }; // timeout / SERVFAIL / refused
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anon";
  if (!rateLimit(`mail:${ip}`))
    return NextResponse.json({ error: "Too many checks. Try again in a minute." }, { status: 429 });

  let body: { target?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const domain = cleanDomain(String(body.target ?? ""));

    const [spfLookup, dmarcLookup, mx] = await Promise.all([
      txt(domain),
      txt(`_dmarc.${domain}`),
      dns.resolveMx(domain).catch(() => []),
    ]);

    if (spfLookup.failed || dmarcLookup.failed) {
      return NextResponse.json({
        inconclusive: true,
        domain,
        error:
          "DNS did not answer in time, so this check is inconclusive. " +
          "That is a lookup problem on the way to your nameservers, not a finding about your domain. Try again in a moment.",
      }, { status: 200 });
    }

    const spfRecords = spfLookup.records;
    const dmarcRecords = dmarcLookup.records;

    // ---- SPF ----------------------------------------------------------------
    const spf = spfRecords.find((r) => r.toLowerCase().startsWith("v=spf1"));
    let spfVerdict: "missing" | "weak" | "soft" | "strong" = "missing";
    if (spf) {
      const s = spf.toLowerCase();
      if (/[?+]all/.test(s)) spfVerdict = "weak";
      else if (/~all/.test(s)) spfVerdict = "soft";
      else if (/-all/.test(s)) spfVerdict = "strong";
      else spfVerdict = "weak";
    }
    const multipleSpf = spfRecords.filter((r) => r.toLowerCase().startsWith("v=spf1")).length > 1;

    // ---- DMARC --------------------------------------------------------------
    const dmarc = dmarcRecords.find((r) => r.toLowerCase().startsWith("v=dmarc1"));
    const policy = dmarc?.match(/\bp\s*=\s*(none|quarantine|reject)/i)?.[1]?.toLowerCase() ?? null;
    const pct = dmarc?.match(/\bpct\s*=\s*(\d+)/i)?.[1];
    const rua = /\brua\s*=/.test(dmarc ?? "");

    // ---- DKIM (best effort) -------------------------------------------------
    const found: string[] = [];
    await Promise.all(
      DKIM_SELECTORS.map(async (sel) => {
        const r = await txt(`${sel}._domainkey.${domain}`);
        if (r.records.some((x) => /v=dkim1|p=/i.test(x))) found.push(sel);
      }),
    );

    // ---- verdict ------------------------------------------------------------
    // Spoofability is governed by DMARC: without an enforcing policy, a
    // receiver has no instruction to reject mail that fails SPF/DKIM.
    let verdict: "spoofable" | "partial" | "protected";
    let headline: string;
    if (!dmarc || policy === "none") {
      verdict = "spoofable";
      headline = dmarc
        ? "Anyone can send email as this domain. DMARC is present but set to p=none, which only monitors — it never tells receivers to reject."
        : "Anyone can send email as this domain. There is no DMARC record, so nothing instructs receiving servers to reject forged mail.";
    } else if (policy === "quarantine" || (pct && Number(pct) < 100)) {
      verdict = "partial";
      headline =
        "Partially protected. Forged mail is likely to land in spam rather than be rejected outright" +
        (pct && Number(pct) < 100 ? `, and the policy only applies to ${pct}% of messages.` : ".");
    } else {
      verdict = "protected";
      headline = "Well configured. DMARC is set to reject, so forged mail should be refused.";
    }

    const notes: string[] = [];
    if (!spf) notes.push("No SPF record — receivers have no list of servers allowed to send for you.");
    if (spfVerdict === "weak") notes.push("SPF ends in +all or ?all, which permits any server to send as you. This effectively disables SPF.");
    if (multipleSpf) notes.push("More than one SPF record found. This is invalid and causes SPF to fail entirely.");
    if (dmarc && !rua) notes.push("DMARC has no rua= address, so you receive no reports and cannot see who is spoofing you.");
    if (found.length === 0) notes.push("No DKIM key found on common selectors. It may exist on a custom selector — DKIM selectors cannot be enumerated from DNS, so treat this as inconclusive.");
    if (mx.length === 0) notes.push("No MX records — this domain does not receive mail.");

    return NextResponse.json({
      domain,
      verdict,
      headline,
      spf: { record: spf ?? null, verdict: spfVerdict, duplicates: multipleSpf },
      dmarc: { record: dmarc ?? null, policy, pct: pct ?? null, reporting: rua },
      dkim: { selectorsFound: found, inconclusive: found.length === 0 },
      mx: mx.map((m) => m.exchange).slice(0, 5),
      notes,
    });
  } catch (e) {
    if (e instanceof UnsafeTargetError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    return NextResponse.json({ error: "Lookup failed." }, { status: 500 });
  }
}
