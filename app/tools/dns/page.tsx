import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ToolShell from "@/components/tools/ToolShell";
import { Faq, Section, ToolSchema, type QA } from "@/components/tools/ToolContent";

const URL = "https://amansploit.com/tools/dns";
const DESCRIPTION =
  "Check your domain's DNS hygiene — CAA, DNSSEC, nameserver resilience, wildcards, null MX and dangling CNAMEs that enable subdomain takeover. Free and passive.";

export const metadata: Metadata = {
  title: "Free DNS Hygiene Checker — CAA, DNSSEC, Dangling Records | amansploit",
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: "DNS hygiene checker", description: DESCRIPTION, url: URL, siteName: "amansploit", type: "website" },
  twitter: { card: "summary_large_image" },
};

const FAQ: QA[] = [
  {
    q: "What is a CAA record and why would I want one?",
    a: "CAA tells certificate authorities which of them are allowed to issue certificates for your domain. Without it, every CA in the world is permitted to issue for you, and a mis-issued certificate would be perfectly valid in every browser. You would only discover it by watching the certificate transparency logs. A CAA record is one line of DNS and it turns 'anyone may' into 'only these may'.",
  },
  {
    q: "Is DNSSEC actually worth enabling?",
    a: "It closes a real gap: without it, a resolver has no way to tell a genuine answer from a forged one, which is what makes cache poisoning possible. The honest counterweight is that it is easy to break — a botched key rollover takes your domain off the internet entirely, not just partially. Enable it if your DNS provider handles the key management for you. If rolling keys would be a manual job somebody has to remember, the risk of the outage may genuinely exceed the risk it prevents.",
  },
  {
    q: "What is a dangling record and why is it flagged so seriously?",
    a: "It's a CNAME pointing at a hostname that no longer exists — usually a cloud service that was decommissioned while the DNS record was left behind. If the provider lets anyone claim that name, whoever claims it can serve content from your subdomain, with a valid certificate, indistinguishable from you. That is subdomain takeover. This check reports only that the target doesn't resolve, which is the precondition; whether it is actually claimable depends on the provider and changes constantly.",
  },
  {
    q: "What's wrong with a wildcard DNS record?",
    a: "Two things. It makes it impossible to enumerate what genuinely exists, including for you, which quietly hides forgotten infrastructure. And it hands anyone a valid-looking hostname on your domain — invoices.yourcompany.com resolves whether or not you created it, which is a gift for phishing. Wildcards are occasionally the right call, but they should be a decision rather than a default.",
  },
  {
    q: "Why does it say my DNSSEC status is unknown?",
    a: "Because the validating resolver this check uses didn't answer in time. Reporting that as 'not signed' would tell you your domain is unprotected when it may be perfectly fine, and a false alarm from a security tool is worse than no answer. Try again in a moment.",
  },
  {
    q: "Does this scan my nameservers?",
    a: "No. Every check here is an ordinary DNS query — the same lookups any resolver on the internet performs for your domain constantly. No zone transfer is attempted, nothing is brute-forced, and the subdomain checks are a short fixed list of common names rather than a dictionary attack.",
  },
];

export default async function Page() {
  await connection();
  return (
    <>
      <Nav />
      <ToolShell
        kicker="// FREE TOOL"
        title="DNS hygiene"
        intro="DNS is the layer everything else depends on and almost nobody audits. This checks who may issue certificates for you, whether your answers can be verified, whether a single provider outage takes you offline, and whether any records point somewhere that no longer exists."
        placeholder="yourcompany.com"
        endpoint="/api/tools/dns"
        cta="Check DNS"
        variant="dns"
      >
        <Section h="Why DNS is worth auditing">
          <p>
            Every other control assumes DNS answered correctly. Your certificate, your mail
            authentication, your users reaching the right server — all of it is downstream of
            a lookup that most organisations configured once and never revisited.
          </p>
          <p>
            The findings here are rarely dramatic on their own. They matter because they are
            preconditions: a dangling CNAME is not a breach, it is the thing that makes one
            cheap.
          </p>
        </Section>

        <Section h="Related">
          <p>
            The{" "}
            <Link href="/tools/email-spoofing" className="text-acid hover:underline">
              email spoofability check
            </Link>{" "}
            covers SPF, DKIM and DMARC, which are also DNS records but deserve their own
            treatment. The{" "}
            <Link href="/tools/attack-surface" className="text-acid hover:underline">
              attack surface check
            </Link>{" "}
            finds subdomains you may not know exist.
          </p>
        </Section>

        <Faq items={FAQ} />
      </ToolShell>
      <ToolSchema name="DNS hygiene checker" url={URL} description={DESCRIPTION} faq={FAQ} />
      <Footer />
    </>
  );
}
