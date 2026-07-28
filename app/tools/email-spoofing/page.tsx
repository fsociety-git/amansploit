import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ToolShell from "@/components/tools/ToolShell";
import { Faq, Section, ToolSchema, type QA } from "@/components/tools/ToolContent";

const URL = "https://amansploit.com/tools/email-spoofing";
const DESCRIPTION =
  "Check whether anyone can forge email from your domain. Free SPF, DKIM and DMARC lookup with a plain-English verdict and the exact records to fix it.";

export const metadata: Metadata = {
  title: "Can Someone Send Email As You? Free SPF/DKIM/DMARC Check | amansploit",
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: "Can someone send email as you?",
    description: DESCRIPTION,
    url: URL,
    siteName: "amansploit",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

/**
 * The questions here are the ones people actually type, not the ones that make
 * the tool look good. "I have SPF, am I protected" is the single most common
 * misconception in email security and answering it honestly is more useful than
 * anything else on the page.
 */
const FAQ: QA[] = [
  {
    q: "I already have SPF. Doesn't that stop spoofing?",
    a: "No, and this is the misconception that leaves most domains exposed. SPF publishes a list of servers allowed to send mail for your domain — it is a way for a receiver to detect that a message came from somewhere unexpected. It says nothing about what the receiver should do next. Without a DMARC policy telling it to reject, a receiving server is entitled to deliver the message anyway, and many will. SPF and DKIM are detection. DMARC is enforcement.",
  },
  {
    q: "What does p=none mean? I have a DMARC record.",
    a: "p=none is monitoring mode. It asks receivers to send you reports about mail claiming to be from your domain, and explicitly instructs them not to reject anything. It is the correct place to start a rollout and a bad place to stop. A great many domains are set to p=none during a migration and simply never move on — years pass. If your record says p=none, treat yourself as unprotected.",
  },
  {
    q: "My domain doesn't send any email. Do I still need this?",
    a: "Yes, and arguably more urgently. A domain that sends no mail and publishes no policy is a free, credible sending identity for anyone who wants one — nobody is monitoring it and nothing will bounce. For a domain with no mail flow the fix is a single pass with no monitoring period: publish v=spf1 -all and a DMARC record with p=reject. That says nothing is authorised to send as this domain and forgeries should be refused.",
  },
  {
    q: "Will moving to p=reject break my legitimate email?",
    a: "It will if you skip the middle steps, and this is the real reason so many domains stall at p=none. Almost every organisation has forgotten senders — the CRM, the invoicing tool, the ticketing system, a marketing platform someone set up in 2019. Publish p=none with a reporting address first, read the reports until every legitimate source passes SPF or DKIM, then move to p=quarantine, then to p=reject. For an organisation of any size that is usually four to eight weeks, almost all of it spent reading reports rather than editing DNS.",
  },
  {
    q: "What does an SPF record ending in +all do?",
    a: "It authorises the entire internet to send mail as your domain. The final mechanism tells receivers how to treat anything not explicitly listed: -all means reject, ~all means treat as suspicious, and +all means allow. It appears more often than you would expect, usually left behind by someone debugging a delivery problem who never reverted the change. If this check finds +all on your domain, fix it today.",
  },
  {
    q: "Is DKIM required for this?",
    a: "Not to stop spoofing, no — DMARC can pass on SPF alignment alone. DKIM matters because it survives forwarding. When a mailing list or a forwarding rule relays your message, the connecting server is no longer one of your SPF-listed hosts and SPF alignment breaks, but a DKIM signature travels with the message and still validates. If you enforce DMARC without DKIM, forwarded legitimate mail is what breaks first.",
  },
  {
    q: "Does this tool store my domain or send me anything?",
    a: "No. It performs public DNS lookups — the same queries any mail server on the internet makes when it receives a message from you — and returns the result. There is no signup, no email capture, no logging of results against you, and nothing is sent anywhere. You could run these lookups yourself with dig; this just formats the answer.",
  },
];

export default async function Page() {
  await connection();
  return (
    <>
      <Nav />
      <ToolShell
        kicker="// FREE TOOL"
        title="Can someone send email as you?"
        intro="If your domain has no enforcing DMARC policy, anyone on the internet can send email that appears to come from your CEO — and receiving servers have been given no instruction to stop it. This checks in a few seconds."
        placeholder="yourcompany.com"
        endpoint="/api/tools/email"
        cta="Check my domain"
        variant="email"
      >
        <Section h="What this actually checks">
          <p>
            Three DNS records, and the relationship between them. <strong className="text-ink">SPF</strong>{" "}
            lists the servers allowed to send mail for your domain.{" "}
            <strong className="text-ink">DKIM</strong> lets a receiver verify cryptographically
            that a message came from your infrastructure and was not altered in transit.{" "}
            <strong className="text-ink">DMARC</strong> is the policy that ties them together
            and tells a receiving server what to do when a message fails both.
          </p>
          <p>
            The verdict is based on the third one. A domain with immaculate SPF and DKIM and no
            enforcing DMARC policy is still spoofable, because detection without enforcement
            changes nothing about what lands in someone&apos;s inbox.
          </p>
        </Section>

        <Section h="Why this matters more than it sounds">
          <p>
            Business email compromise does not need a technical exploit. It needs a message
            that looks right — an invoice redirect from what appears to be the finance
            director, a credential request from what appears to be IT. The entire attack rests
            on the sending domain never having told receivers to refuse forgeries.
          </p>
          <p>
            It is also one of the cheapest things on any security backlog. The DNS changes take
            minutes. The work is in finding out who legitimately sends mail as you, which is
            worth knowing regardless.
          </p>
        </Section>

        <Faq items={FAQ} />

        <Section h="Read more">
          <p>
            <Link href="/blog/your-domain-is-probably-spoofable" className="text-acid hover:underline">
              Your domain is probably spoofable — and you can check in ten seconds
            </Link>{" "}
            goes through the three failure modes in detail and gives the exact records to
            publish, in the order to publish them.
          </p>
        </Section>
      </ToolShell>
      <ToolSchema
        name="Email spoofability checker (SPF, DKIM, DMARC)"
        url={URL}
        description={DESCRIPTION}
        faq={FAQ}
      />
      <Footer />
    </>
  );
}
