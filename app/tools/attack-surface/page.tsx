import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ToolShell from "@/components/tools/ToolShell";
import { Faq, Section, ToolSchema, type QA } from "@/components/tools/ToolContent";

const URL = "https://amansploit.com/tools/attack-surface";
const DESCRIPTION =
  "Find every subdomain of your domain from public certificate transparency logs, and see which still resolve. Free, passive, no signup — the same first move an attacker makes.";

export const metadata: Metadata = {
  title: "What Can The Internet See? Free Subdomain & Attack Surface Check | amansploit",
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: "What the internet can see",
    description: DESCRIPTION,
    url: URL,
    siteName: "amansploit",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

const FAQ: QA[] = [
  {
    q: "How does this find subdomains without scanning me?",
    a: "It reads certificate transparency logs. Every certificate authority is required to publish a public, append-only record of every certificate it issues, so the moment anyone requests a certificate for staging.yourcompany.com, that hostname becomes a matter of public record — permanently, whether or not the host was ever deployed. This tool reads those logs and then does an ordinary DNS lookup on each name to see which still resolve. Nothing is connected to and no ports are touched.",
  },
  {
    q: "Can I stop my subdomains appearing in these logs?",
    a: "Not really, and trying is the wrong instinct. Certificate transparency exists so that a certificate cannot be issued for your domain without leaving evidence, which is a protection you want. Wildcard certificates hide individual names, but they bring their own problem: one private key that works for everything. The right response is to assume the names are public and make sure nothing sensitive depends on nobody knowing them.",
  },
  {
    q: "Why does it matter if an old subdomain still resolves?",
    a: "Because forgotten hosts don't get patched. The staging environment nobody has logged into since a migration is still running whatever version it was deployed with, often with a copy of real data and weaker authentication than production. It is also a common route to subdomain takeover: if a DNS record still points at a cloud service that has been deprovisioned, someone else can often claim that name and serve content from your domain.",
  },
  {
    q: "It found nothing. Am I safe?",
    a: "It means no certificates for subdomains of your domain appear in the public logs, which is genuinely useful to know but is not the same as having no attack surface. Hosts served over plain HTTP, or behind a service that terminates TLS on a different domain, never appear here. Neither does anything reachable only by IP address. A clean result narrows the question; it does not close it.",
  },
  {
    q: "Does this tell me whether those hosts are vulnerable?",
    a: "No, and it deliberately doesn't try. It reads names and resolves them. It does not connect to them, fingerprint them, or test anything. A hostname that looks alarming may be perfectly locked down, and a boring-looking one may be the problem. Judging that requires actually looking, which is a different piece of work.",
  },
  {
    q: "Is any of this stored?",
    a: "No. The lookup runs, the result is returned to your browser, and nothing is written down or logged against you. You could run the same queries yourself against crt.sh and dig; this just collates them and flags the names worth a second look.",
  },
];

export default async function Page() {
  await connection();
  return (
    <>
      <Nav />
      <ToolShell
        kicker="// FREE TOOL"
        title="What the internet can see"
        intro="Every certificate ever issued for your domain is a matter of public record. This reads those logs, finds hostnames you may have forgotten about, and checks which of them still resolve today — the same first move an attacker makes, and it costs them nothing either."
        placeholder="yourcompany.com"
        endpoint="/api/tools/attack-surface"
        cta="Show me"
        variant="surface"
      >
        <Section h="Why this is the first thing anyone looks at">
          <p>
            Attacking a well-defended application is hard work. Finding the thing next to it
            that nobody remembered — a staging copy, an old admin panel, a monitoring
            dashboard someone stood up for a week in 2023 — is almost free. That is why
            reconnaissance starts here rather than at your front door.
          </p>
          <p>
            The uncomfortable part of this check is rarely the count. It is recognising a
            hostname and realising you have no idea who owns it now.
          </p>
        </Section>

        <Section h="What the results mean">
          <p>
            <strong className="text-ink">In the logs</strong> is every hostname under your
            domain that has ever been issued a certificate. Names stay there permanently, so
            this includes things long since switched off.
          </p>
          <p>
            <strong className="text-ink">Still resolving</strong> is the subset that has a DNS
            record right now. These are live in the sense that a browser can find them.
          </p>
          <p>
            <strong className="text-ink">Worth a look</strong> is flagged on the name alone —
            words like <code>admin</code>, <code>staging</code>, <code>vpn</code> or{" "}
            <code>jenkins</code>. That is a heuristic, not a finding. It is telling you where
            to point your attention, not that something is wrong.
          </p>
        </Section>

        <Section h="Read more">
          <p>
            The{" "}
            <Link href="/fix#attack-surface" className="text-acid hover:underline">
              fixed-price review
            </Link>{" "}
            goes further than this page can: what each host actually serves, which ones
            respond, expired certificates, and a prioritised list of what to turn off. Or run
            the other{" "}
            <Link href="/tools" className="text-acid hover:underline">
              free checks
            </Link>{" "}
            first — they cover different ground.
          </p>
        </Section>
        <Faq items={FAQ} />
      </ToolShell>
      <ToolSchema
        name="Attack surface and subdomain discovery"
        url={URL}
        description={DESCRIPTION}
        faq={FAQ}
      />
      <Footer />
    </>
  );
}
