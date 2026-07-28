import { headers } from "next/headers";
import dns from "node:dns/promises";
import Link from "next/link";
import { SECURITY_HEADERS } from "@/lib/security-headers";

/**
 * Proof, rather than claims.
 *
 * Everything else on this page is my word for it. This section runs the same
 * checks the free tools run, against this domain, at the moment you load the
 * page — and prints whatever comes back. If I ever let a control slip, this
 * says so on my own homepage before anyone has to ask.
 *
 * Two different kinds of evidence, labelled as such rather than blurred:
 *
 *  · The CSP is read off the header set attached to *this* request by
 *    proxy.ts. That is the literal policy your browser is enforcing right now,
 *    nonce and all.
 *  · SPF and DMARC are live public DNS lookups performed server-side on each
 *    request. Nothing cached, nothing hardcoded.
 *  · The static headers render from lib/security-headers.ts, which is the same
 *    array next.config.ts serves. Not a live scan — a shared source of truth,
 *    so the boast cannot outlive the configuration.
 *
 * Deliberately NOT doing: an HTTP fetch of this site from this site. The host
 * answers scanner-shaped requests with a 403 interstitial, so that would grade
 * the edge network's headers rather than the application's — a confident number
 * about the wrong thing. The free header tool refuses to grade blocked
 * responses for exactly this reason; it would be strange to make an exception
 * for my own site.
 */

export const dynamic = "force-dynamic";

/**
 * Three states, not two. A resolver timeout is not the same thing as a missing
 * record, and conflating them would make this section shout "SOMETHING IS
 * FAILING" on the homepage every time DNS hiccups — crying wolf on the one
 * component whose entire value is being trustworthy. Same discipline the email
 * tool already applies to other people's domains; it would be odd to hold my
 * own to a sloppier standard.
 */
type State = "pass" | "fail" | "unknown";

interface DnsResult {
  state: State;
  detail: string;
}

/** A hanging resolver must not hang the homepage. */
async function withTimeout<T>(p: Promise<T>, ms = 2500): Promise<T> {
  let timer: NodeJS.Timeout;
  const bail = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("dns timeout")), ms);
  });
  try {
    return await Promise.race([p, bail]);
  } finally {
    clearTimeout(timer!);
  }
}

async function checkSpf(): Promise<DnsResult> {
  try {
    const txt = (await withTimeout(dns.resolveTxt("amansploit.com"))).map((r) => r.join(""));
    const spf = txt.find((r) => r.toLowerCase().startsWith("v=spf1"));
    if (!spf) return { state: "fail", detail: "no record published" };
    const enforcing = /[-~]all\s*$/.test(spf.trim());
    return {
      state: enforcing ? "pass" : "fail",
      detail: enforcing ? spf : `${spf} — does not end in -all or ~all`,
    };
  } catch (e) {
    // ENODATA/ENOTFOUND mean the record genuinely is not there. Anything else —
    // timeout, SERVFAIL, refused — means we do not know.
    const code = (e as NodeJS.ErrnoException)?.code;
    if (code === "ENODATA" || code === "ENOTFOUND")
      return { state: "fail", detail: "no record published" };
    return { state: "unknown", detail: "lookup inconclusive — resolver did not answer" };
  }
}

async function checkDmarc(): Promise<DnsResult> {
  try {
    const txt = (await withTimeout(dns.resolveTxt("_dmarc.amansploit.com"))).map((r) =>
      r.join(""),
    );
    const rec = txt.find((r) => r.toLowerCase().startsWith("v=dmarc1"));
    if (!rec) return { state: "fail", detail: "no record published" };
    const policy = rec.match(/p\s*=\s*(none|quarantine|reject)/i)?.[1]?.toLowerCase();
    if (policy === "reject" || policy === "quarantine") return { state: "pass", detail: rec };
    return {
      state: "fail",
      detail: policy === "none" ? `${rec} — p=none is monitoring only` : `${rec} — no policy`,
    };
  } catch (e) {
    const code = (e as NodeJS.ErrnoException)?.code;
    if (code === "ENODATA" || code === "ENOTFOUND")
      return { state: "fail", detail: "no record published" };
    return { state: "unknown", detail: "lookup inconclusive — resolver did not answer" };
  }
}

const MARK: Record<State, { glyph: string; cls: string; sr: string }> = {
  pass: { glyph: "▸", cls: "text-acid", sr: "passing" },
  fail: { glyph: "×", cls: "text-red-400", sr: "failing" },
  unknown: { glyph: "?", cls: "text-yellow-400", sr: "inconclusive" },
};

function Row({ state, name, value }: { state: State; name: string; value: string }) {
  const m = MARK[state];
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-3 border-t border-line/60">
      <div className="flex items-center gap-2 sm:w-64 shrink-0">
        <span className={m.cls} aria-hidden>
          {m.glyph}
        </span>
        <span className="font-mono text-[13px] text-ink">{name}</span>
        <span className="sr-only">{m.sr}</span>
      </div>
      <div className="font-mono text-[12px] text-dim break-all leading-relaxed">{value}</div>
    </div>
  );
}

export default async function SelfScan() {
  const h = await headers();
  // proxy.ts attaches the freshly-minted policy to the request as well as the
  // response, which is the only way a Server Component can see the real nonce.
  const csp = h.get("content-security-policy") ?? "";
  const scriptSrc = csp.match(/script-src ([^;]+)/)?.[1]?.trim() ?? "";
  const hasNonce = /'nonce-[^']+'/.test(scriptSrc);
  const noUnsafeInline = !/'unsafe-inline'/.test(scriptSrc);

  const [spf, dmarc] = await Promise.all([checkSpf(), checkDmarc()]);

  const cspState: State = csp ? (hasNonce && noUnsafeInline ? "pass" : "fail") : "unknown";
  const states: State[] = [cspState, spf.state, dmarc.state];
  const anyFail = states.includes("fail");
  const anyUnknown = states.includes("unknown");

  const verdict = anyFail
    ? { text: "SOMETHING IS FAILING", cls: "text-red-400" }
    : anyUnknown
      ? { text: "ONE CHECK INCONCLUSIVE", cls: "text-yellow-400" }
      : { text: "ALL CHECKS PASSING", cls: "text-acid" };

  return (
    <section id="self-scan" className="relative scroll-mt-16 border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <div className="kicker mb-3">// LIVE SELF-SCAN</div>
        <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight max-w-2xl">
          Everything above is my word for it.
        </h2>
        <p className="mt-4 max-w-2xl text-dim leading-relaxed">
          This part isn&apos;t. The checks below run against this domain when you load the
          page, using the same logic as the{" "}
          <Link href="/tools" className="text-acid hover:underline">
            free tools
          </Link>
          . Whatever they return is what you see — including, one day, a failure I have
          not noticed yet.
        </p>

        <div className="mt-10 rounded-xl border border-line bg-panel/40 p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
            <div className="font-mono text-xs text-dim uppercase tracking-wider">
              amansploit.com
            </div>
            <div className={`font-mono text-sm font-bold tracking-widest ${verdict.cls}`}>
              {verdict.text}
            </div>
          </div>

          <Row
            state={cspState}
            name="Content-Security-Policy"
            value={
              csp
                ? `script-src ${scriptSrc}`
                : "not visible to this render — check the response headers directly"
            }
          />
          {SECURITY_HEADERS.filter((x) => x.key !== "X-DNS-Prefetch-Control").map((x) => (
            <Row key={x.key} state="pass" name={x.key} value={x.value} />
          ))}
          <Row state={spf.state} name="SPF" value={spf.detail} />
          <Row state={dmarc.state} name="DMARC" value={dmarc.detail} />
        </div>

        {/* Being precise about what is and isn't live is the whole point. */}
        <div className="mt-6 grid md:grid-cols-2 gap-6 text-[13px] text-dim leading-relaxed">
          <p>
            <span className="text-ink font-medium">What&apos;s genuinely live:</span> the CSP
            is read off the header set attached to this exact request, nonce included — it
            is the policy your browser is enforcing right now. SPF and DMARC are public DNS
            lookups performed server-side on every load.
          </p>
          <p>
            <span className="text-ink font-medium">What isn&apos;t:</span> the static headers
            render from the same array the server config uses, not from a fetch of this
            page. I don&apos;t scan this site from itself, because the host answers
            scanner-shaped requests with a 403 and I&apos;d be grading the edge network
            rather than the application. For an independent check, run the domain through{" "}
            <a
              href="https://securityheaders.com/?q=https%3A%2F%2Famansploit.com&followRedirects=on"
              target="_blank"
              rel="noopener noreferrer"
              className="text-acid hover:underline"
            >
              securityheaders.com
            </a>{" "}
            or my own{" "}
            <Link href="/tools/email-spoofing" className="text-acid hover:underline">
              spoofability checker
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
