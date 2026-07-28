import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Free Security Tools | amansploit",
  description:
    "Free, passive security checks: HTTP security headers grading and email spoofability (SPF/DKIM/DMARC). No signup, nothing stored.",
  alternates: { canonical: "https://amansploit.com/tools" },
};

export const TOOLS_LIST = [
  {
    href: "/tools/email-spoofing",
    name: "Can someone send email as you?",
    desc: "Checks SPF, DKIM and DMARC and tells you, in plain English, whether anyone can forge mail from your domain. Most companies fail this.",
    tag: "SPF · DKIM · DMARC",
  },
  {
    href: "/tools/attack-surface",
    name: "What the internet can see",
    desc: "Finds every subdomain ever issued a certificate from public transparency logs, checks which still resolve, and flags the ones whose names suggest admin panels or forgotten staging environments.",
    tag: "subdomains \u00b7 attack surface",
  },
  {
    href: "/tools/dns",
    name: "DNS hygiene",
    desc: "CAA, DNSSEC, nameserver resilience, wildcard records, and dangling CNAMEs pointing at services that no longer exist \u2014 the precondition for subdomain takeover.",
    tag: "CAA \u00b7 DNSSEC \u00b7 takeover",
  },
  {
    href: "/tools/tls",
    name: "TLS configuration",
    desc: "Which protocol versions and ciphers your server still negotiates, whether the certificate chain validates, and how long before it expires. A padlock says none of this.",
    tag: "TLS \u00b7 ciphers \u00b7 certificates",
  },
  {
    href: "/tools/security-headers",
    name: "Security headers checker",
    desc: "Grades your HTTP response headers — CSP, HSTS, frame protection and more — and gives you the exact values to set.",
    tag: "CSP · HSTS · headers",
  },
  {
    href: "/tools/jwt",
    name: "JWT decoder",
    desc: "Read a JSON Web Token's claims with the expiry as a real date, and the usual mistakes flagged \u2014 alg:none, no expiry, lifetimes measured in months. Runs in your browser; the token never leaves the page.",
    tag: "JWT \u00b7 in-browser",
  },
  {
    href: "/tools/cvss",
    name: "CVSS 3.1 calculator",
    desc: "Base score and vector string, implemented against the specification including the round-up rule most calculators get wrong \u2014 with an honest note on where CVSS stops helping.",
    tag: "CVSS \u00b7 scoring",
  },
  {
    href: "/tools/hash",
    name: "Hash identifier",
    desc: "What format is this hash? Where several share a shape, all are listed rather than guessing \u2014 a confident wrong answer costs hours.",
    tag: "hashes \u00b7 in-browser",
  },
];

export default async function ToolsPage() {
  await connection();
  return (
    <>
      <Nav />
      <main id="content" className="flex-1 bg-void">
        <div className="mx-auto max-w-3xl px-5 pt-32 pb-20">
          <div className="kicker">// FREE TOOLS</div>
          <h1 className="mt-3 font-display font-bold text-4xl md:text-5xl tracking-tight">
            Check a few things yourself.
          </h1>
          <p className="mt-4 text-lg text-dim leading-relaxed">
            Passive checks you can run on your own domain in a few seconds. No signup, no
            email wall, nothing stored. If they turn something up and you want a hand
            fixing it, you know where to find me.
          </p>

          <div className="mt-10 space-y-4">
            {TOOLS_LIST.map((t) => (
              <Link key={t.href} href={t.href} prefetch={false} className="block card-line card-hover rounded-xl p-6">
                <div className="kicker">{t.tag}</div>
                <h2 className="mt-2 font-display font-bold text-xl">{t.name}</h2>
                <p className="mt-2 text-[15px] text-dim leading-relaxed">{t.desc}</p>
                <div className="mt-3 font-mono text-xs text-acid">run it →</div>
              </Link>
            ))}
          </div>

          <div className="mt-10 card-line rounded-xl p-6 border-acid/25">
            <div className="kicker mb-2">If a check turns something up</div>
            <p className="text-sm text-dim leading-relaxed">
              Every result comes with the exact fix, and you are welcome to take it and do
              nothing else — that is genuinely the point of publishing these. If you would
              rather someone else did it, there are{" "}
              <Link href="/fix" className="text-acid hover:underline">
                fixed-price fixes from ₹6,000
              </Link>
              , scoped tightly enough to quote without a call. If a check comes back clean,
              nothing is offered, because there would be nothing to sell.
            </p>
          </div>

          <div className="mt-6 card-line rounded-xl p-6">
            <div className="kicker mb-2">How these work</div>
            <p className="text-sm text-dim leading-relaxed">
              Everything here is passive: public DNS lookups and a single HTTP request for
              response headers. Nothing is scanned, no payloads are sent, no response
              bodies are read, and no results are stored or logged against you. The
              endpoints validate every target against private address ranges before
              connecting, because a tool that fetches user-supplied URLs is an SSRF vector
              and it would be embarrassing to get that wrong here of all places.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}