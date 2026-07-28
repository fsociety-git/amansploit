import type { Metadata } from "next";
import { connection } from "next/server";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ToolShell from "@/components/tools/ToolShell";
import { Faq, Section, ToolSchema, type QA } from "@/components/tools/ToolContent";

const URL = "https://amansploit.com/tools/security-headers";
const DESCRIPTION =
  "Check any website's HTTP security headers — CSP, HSTS, X-Frame-Options and more — and get a grade with the exact fixes. Free, passive, no signup.";

export const metadata: Metadata = {
  title: "Free Security Headers Checker — Grade Your HTTP Headers | amansploit",
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: "Security headers checker",
    description: DESCRIPTION,
    url: URL,
    siteName: "amansploit",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

const FAQ: QA[] = [
  {
    q: "Do security headers actually stop attacks?",
    a: "Some do, some only reduce blast radius, and being honest about which is which matters. A Content-Security-Policy genuinely prevents a whole class of cross-site scripting from executing. X-Frame-Options genuinely prevents clickjacking. Strict-Transport-Security genuinely prevents a downgrade to plaintext after the first visit. Others are closer to hygiene. None of them fix an authorisation flaw in your API, and a site with perfect headers can still be trivially compromised — headers are a floor, not a ceiling.",
  },
  {
    q: "Will a Content-Security-Policy break my site?",
    a: "A strict one will, immediately, if your site relies on inline scripts or third-party embeds — which most do. That is why almost every CSP in the wild contains 'unsafe-inline', which removes most of the protection. The path that works is to deploy the policy in report-only mode first, collect violation reports until you know what your own site actually loads, then enforce. Expect to find things you did not know were there.",
  },
  {
    q: "What is a good grade?",
    a: "Any site handling logins or payments should be at A. Getting to A+ usually comes down to one thing: removing 'unsafe-inline' from script-src, which means adopting a per-request nonce or hashes. It is genuinely fiddly on a framework you did not write. It is also the difference between a policy that stops injected scripts and a policy that only looks like it does.",
  },
  {
    q: "Why did my site come back inconclusive instead of graded?",
    a: "Because the server returned 401, 403, 405, 429 or 503, which usually means a WAF or bot filter answered instead of your application. Those responses carry the WAF's headers, not yours, so grading them would produce a confident number about the wrong thing. Refusing to guess is the correct behaviour here — a wrong grade is worse than no grade. If this happens, check the headers from a browser you are logged into, or from your own server.",
  },
  {
    q: "Does the grade depend on my site being publicly reachable?",
    a: "Yes. This makes a single ordinary HTTP request from the internet and reads the response headers. It cannot see anything behind a login, a VPN, or an IP allowlist, and it will not reach a staging environment that is not published. Note also that staging and production frequently differ on exactly these headers, so grade the environment you actually serve to users.",
  },
  {
    q: "Is this scanning or attacking my site?",
    a: "Neither. It makes one request, reads the response headers, and never reads the response body. No payloads, no probing of paths, no crawling. It is indistinguishable from a single visitor loading your homepage once. The endpoint also validates the target against private and loopback address ranges before connecting, because a tool that fetches user-supplied URLs is a server-side request forgery vector and it would be a poor advertisement to get that wrong here.",
  },
];

export default async function Page() {
  await connection();
  return (
    <>
      <Nav />
      <ToolShell
        kicker="// FREE TOOL"
        title="Security headers checker"
        intro="HTTP response headers are the cheapest security controls you will ever deploy — and most sites are missing several. Enter a domain to see which, why each one matters, and exactly what to set."
        placeholder="example.com"
        endpoint="/api/tools/headers"
        cta="Check headers"
        variant="headers"
      >
        <Section h="What each header is for">
          <p>
            <strong className="text-ink">Content-Security-Policy</strong> controls what the
            browser is allowed to load and execute. It is the only header here that stops an
            injected script from running, and the only one that takes real work to deploy.
          </p>
          <p>
            <strong className="text-ink">Strict-Transport-Security</strong> tells the browser
            to refuse plaintext HTTP to your domain for a set period, closing the downgrade
            window after a visitor&apos;s first successful visit.
          </p>
          <p>
            <strong className="text-ink">X-Frame-Options</strong> (or CSP&apos;s{" "}
            <code>frame-ancestors</code>) stops your pages being framed by someone else&apos;s,
            which is what makes clickjacking possible.{" "}
            <strong className="text-ink">X-Content-Type-Options: nosniff</strong> stops the
            browser second-guessing your declared content types.{" "}
            <strong className="text-ink">Referrer-Policy</strong> controls how much of your URL
            leaks to third parties, which matters if your URLs contain identifiers.{" "}
            <strong className="text-ink">Permissions-Policy</strong> switches off browser
            features — camera, microphone, geolocation — that your site does not use.
          </p>
        </Section>

        <Section h="What a grade here does and does not tell you">
          <p>
            It tells you whether a set of cheap, well-understood browser controls are switched
            on. That is worth knowing and worth fixing, usually in an afternoon.
          </p>
          <p>
            It tells you nothing about whether one of your customers can read another
            customer&apos;s orders, whether your password reset can be replayed, or whether an
            expired session still works. Those require someone to hold your application&apos;s
            logic in their head, and no header check will ever find them. Treat a good grade as
            evidence that the basics are handled, not as evidence that the application is
            sound.
          </p>
        </Section>

        <Faq items={FAQ} />
      </ToolShell>
      <ToolSchema
        name="HTTP security headers checker"
        url={URL}
        description={DESCRIPTION}
        faq={FAQ}
      />
      <Footer />
    </>
  );
}
