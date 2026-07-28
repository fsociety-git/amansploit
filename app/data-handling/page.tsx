import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { LINKS } from "@/lib/data";

const URL = "https://amansploit.com/data-handling";

export const metadata: Metadata = {
  title: "How I Handle Your Data | amansploit",
  description:
    "What is collected during an engagement, where it is stored, how long it is kept, and what happens to it at the end. Written plainly, no legal padding.",
  alternates: { canonical: URL },
  openGraph: {
    title: "How I handle your data",
    description:
      "What is collected during an engagement, where it is stored, how long it is kept, and what happens to it at the end.",
    url: URL,
    siteName: "amansploit",
    type: "website",
  },
};

/**
 * This page exists because my own writing tells buyers to ask providers what
 * happens to their data, and it would be a poor look to give that advice and
 * then not answer it myself. It is deliberately specific and deliberately not
 * written by a lawyer — a policy nobody can read protects nobody.
 */
function S({ h, children }: { h: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="font-display font-bold text-2xl tracking-tight">{h}</h2>
      <div className="mt-4 space-y-4 text-[15px] text-dim leading-relaxed">{children}</div>
    </section>
  );
}

export default async function Page() {
  await connection();
  return (
    <>
      <Nav />
      <main id="content" className="flex-1 bg-void">
        <div className="mx-auto max-w-3xl px-5 pt-32 pb-20">
          <div className="kicker">// DATA HANDLING</div>
          <h1 className="mt-3 font-display font-bold text-4xl md:text-5xl tracking-tight">
            What happens to your data.
          </h1>
          <p className="mt-4 text-lg text-dim leading-relaxed">
            A penetration test means handing a stranger access to systems that matter, and
            then trusting them with whatever falls out of it. Here is exactly what I collect,
            where it lives, how long I keep it and what happens at the end — written to be
            read rather than to be defensible.
          </p>

          <S h="What gets collected">
            <p>
              Evidence, not data. A finding needs enough to prove it exists and enough for
              your engineers to reproduce it: the request, the response, the conditions. It
              does not need your customer table.
            </p>
            <p>
              Where a vulnerability exposes personal or sensitive information, I record the
              minimum that demonstrates the exposure — typically a single record, with
              identifying fields masked at the point of capture rather than redacted later.
              If proving an issue would require extracting data at volume, I stop and
              describe the extraction path instead of walking it.
            </p>
          </S>

          <S h="Where it lives">
            <p>
              On an encrypted disk on hardware I control, in a per-engagement directory. Not
              in a shared drive, not in a note-taking service that syncs somewhere, not in an
              AI tool.
            </p>
            <p>
              Credentials you issue me for testing go in a password manager and nowhere else.
              They are never committed to a repository, pasted into a ticket, or reused
              across engagements.
            </p>
          </S>

          <S h="How long I keep it">
            <p>
              Working evidence is deleted <strong className="text-ink">30 days</strong> after
              the retest concludes, or immediately on request — whichever comes first. The
              30 days exist so that a question in week three can still be answered properly.
            </p>
            <p>
              The final report is kept for <strong className="text-ink">12 months</strong> so
              that a follow-up engagement can be scoped against what was found last time. If
              you would rather I did not, say so and I will delete my copy at sign-off. You
              will still have yours.
            </p>
            <p>
              Nothing is retained as a &ldquo;sample&rdquo; or a portfolio piece. The sample
              report on this site describes a fictional company for exactly that reason.
            </p>
          </S>

          <S h="Who else sees it">
            <p>
              Nobody. Engagements are not subcontracted without asking you first, and no
              third-party service processes your findings. That includes AI tools: your
              report is not pasted into one for summarising, editing or drafting.
            </p>
          </S>

          <S h="If I find something I was not looking for">
            <p>
              Occasionally a test surfaces something outside its scope — an exposed
              credential, evidence of a prior compromise, personal data somewhere it should
              not be. I tell you promptly and privately, and I do not investigate further
              without you asking me to.
            </p>
            <p>
              If a test appears to have caused an outage or data loss, you hear about it from
              me immediately, before I try to work out whether it was actually my fault.
            </p>
          </S>

          <S h="Disclosure">
            <p>
              Findings from your engagement are yours. I do not publish them, present them,
              or write about them — including anonymised — without written permission.
            </p>
            <p>
              The one exception is a vulnerability in third-party software discovered during
              your engagement, which I would want to report to that vendor. I would ask you
              first, and the report would describe the flaw without identifying you.
            </p>
          </S>

          <S h="What I will not do">
            <p>
              Test systems you do not own or have written authorisation for. Social-engineer
              your staff unless it is explicitly in scope and agreed in writing. Perform
              denial-of-service testing against production. Retain access after an engagement
              closes.
            </p>
          </S>

          <S h="Reporting a problem with this site">
            <p>
              If you find a vulnerability in amansploit.com itself, I would like to know. See{" "}
              <a href="/.well-known/security.txt" className="text-acid hover:underline">
                security.txt
              </a>{" "}
              for contact details and a PGP key, or just email{" "}
              <a href={`mailto:${LINKS.email}`} className="text-acid hover:underline">
                {LINKS.email}
              </a>
              . No bounty, but genuine thanks and credit if you want it.
            </p>
          </S>

          <div className="mt-14 pt-8 border-t border-line">
            <p className="text-[15px] text-dim leading-relaxed">
              Anything here you would want changed for your engagement, say so before we
              start and we will write it into the scope. It is easier to agree now than to
              discover a mismatch afterwards.
            </p>
            <p className="mt-5">
              <Link href="/#estimate" className="text-acid hover:underline font-medium">
                Get a scope and a price →
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
