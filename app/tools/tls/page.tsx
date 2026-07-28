import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ToolShell from "@/components/tools/ToolShell";
import { Faq, Section, ToolSchema, type QA } from "@/components/tools/ToolContent";

const URL = "https://amansploit.com/tools/tls";
const DESCRIPTION =
  "Check which TLS versions and ciphers a site still accepts, and whether its certificate validates and expires soon. Free, passive, no signup.";

export const metadata: Metadata = {
  title: "Free TLS / SSL Configuration Checker | amansploit",
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: "TLS configuration checker", description: DESCRIPTION, url: URL, siteName: "amansploit", type: "website" },
  twitter: { card: "summary_large_image" },
};

const FAQ: QA[] = [
  {
    q: "Why does it matter that TLS 1.0 is still enabled if browsers won't use it?",
    a: "Browsers won't, but not everything that connects to you is a browser. Old API clients, embedded devices and scripts will happily negotiate whatever the server allows, and an attacker sitting between two parties can influence which version gets chosen. Leaving a deprecated version enabled buys you compatibility with clients you probably don't have, at the cost of a downgrade path you definitely don't want. Turning it off is a single configuration line.",
  },
  {
    q: "What does 'not testable' mean next to a version?",
    a: "It means this checker's own TLS library refused to attempt that version, so no handshake was sent and the server never got the chance to answer. Modern OpenSSL builds disable TLS 1.0 and 1.1 at their default security level. Reporting that as 'the server doesn't support it' would be a guess dressed up as a finding, so it says what actually happened instead.",
  },
  {
    q: "Should I care about TLS 1.3?",
    a: "Yes, and it is usually the easiest win here. It removes entire classes of problem by design — no renegotiation, no static RSA key exchange, a much smaller set of cipher suites with the weak ones simply absent — and it completes the handshake in fewer round trips, so it is also faster. On most modern stacks enabling it is a configuration change rather than a project.",
  },
  {
    q: "My certificate expires in two weeks and this says that's a problem. It renews automatically.",
    a: "Then it isn't a problem — but the flag is still worth having, because automated renewal is exactly the thing everyone believes is working right up until the morning it isn't. If you see this warning and you know renewal is automated, the useful reaction is to check when it last succeeded rather than to dismiss it.",
  },
  {
    q: "Does this connect to my server or attack it?",
    a: "It opens a TLS handshake on port 443 and reads what the server agrees to, then repeats that handshake pinned to each protocol version. No HTTP request is ever sent, so it cannot log in, cannot reach your application, and cannot trigger any behaviour beyond the handshake itself. In your logs it looks like a connection that opened and closed.",
  },
];

export default async function Page() {
  await connection();
  return (
    <>
      <Nav />
      <ToolShell
        kicker="// FREE TOOL"
        title="TLS configuration checker"
        intro="HTTPS being green in the address bar says very little. This checks which protocol versions and ciphers your server is still willing to negotiate, whether the certificate chain actually validates, and how long you have before it expires."
        placeholder="example.com"
        endpoint="/api/tools/tls"
        cta="Check TLS"
        variant="tls"
      >
        <Section h="What a padlock does and doesn't tell you">
          <p>
            The padlock means the connection was encrypted and the certificate validated. It
            says nothing about <em>how</em> it was encrypted. A server that still accepts TLS
            1.0 with a CBC cipher shows the same padlock as one that only speaks TLS 1.3.
          </p>
          <p>
            That gap is the entire point of this check. The failure mode is not a broken
            padlock — it is a perfectly green one in front of a configuration that has not
            been touched since it was set up.
          </p>
        </Section>

        <Section h="What to fix, in order">
          <p>
            Enable TLS 1.3 first: it is the largest improvement for the least work. Then
            disable TLS 1.0 and 1.1, which no current browser will use anyway. Then check
            that certificate renewal is genuinely automated rather than a calendar reminder
            somebody left with the company.
          </p>
        </Section>

        <Faq items={FAQ} />

        <Section h="Related">
          <p>
            TLS is one of three things a browser checks before it renders anything. The{" "}
            <Link href="/tools/security-headers" className="text-acid hover:underline">
              header checker
            </Link>{" "}
            covers the second, and the{" "}
            <Link href="/tools/dns" className="text-acid hover:underline">
              DNS hygiene check
            </Link>{" "}
            covers what happens before the connection is even made.
          </p>
        </Section>
      </ToolShell>
      <ToolSchema name="TLS / SSL configuration checker" url={URL} description={DESCRIPTION} faq={FAQ} />
      <Footer />
    </>
  );
}
