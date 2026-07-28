import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HashScroll from "@/components/HashScroll";
import { OFFERS, inr } from "@/lib/offers";
import { BOOKING_URL, LINKS } from "@/lib/data";

const URL = "https://amansploit.com/fix";
const DESCRIPTION =
  "Fixed-price, fixed-scope security fixes you can buy without a call: DMARC rollout from ₹12,000, security headers from ₹6,000, external attack surface review from ₹15,000.";

export const metadata: Metadata = {
  title: "Fixed-Price Security Fixes | amansploit",
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: "Small things, fixed properly",
    description: DESCRIPTION,
    url: URL,
    siteName: "amansploit",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

/**
 * The bottom rung of the pricing ladder.
 *
 * Everything else on this site starts at ₹45,000, which is a lot to commit to
 * a stranger you met via a free tool ten minutes ago. These are small enough
 * to be a low-risk first purchase and closed enough to quote without a call.
 *
 * Each one names what is NOT included, in the same weight of type as what is —
 * because the failure mode of fixed-price work is a scope argument in week two,
 * and the honest way to avoid that is to write the boundary down before anyone
 * pays.
 */
export default async function Page() {
  await connection();

  return (
    <>
      <Nav />
      <HashScroll />
      <main className="flex-1 bg-void">
        <div className="mx-auto max-w-3xl px-5 pt-32 pb-20">
          <div className="kicker">// FIXED PRICE</div>
          <h1 className="mt-3 font-display font-bold text-4xl md:text-5xl tracking-tight">
            Small things, fixed properly.
          </h1>
          <p className="mt-4 text-lg text-dim leading-relaxed">
            A full assessment starts at ₹45,000 and takes the best part of a week. Sometimes
            you don&apos;t need that — you need one specific thing fixed by someone who has
            done it before. These are scoped tightly enough to quote without a call, and
            priced so that hiring me the first time isn&apos;t a decision you need to take
            to a committee.
          </p>

          <div className="mt-12 space-y-10">
            {OFFERS.map((o) => (
              <section
                key={o.slug}
                id={o.slug}
                className="scroll-mt-24 card-line rounded-xl p-6 md:p-8"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                  <h2 className="font-display font-bold text-2xl tracking-tight">{o.name}</h2>
                  <div className="font-mono text-sm">
                    <span className="text-acid font-bold text-base">{inr(o.price)}</span>
                    <span className="text-dim"> · ${o.usd}</span>
                  </div>
                </div>
                <p className="mt-2 text-[15px] text-dim leading-relaxed">{o.hook}</p>
                <div className="mt-1 font-mono text-xs text-dim">{o.turnaround}</div>

                <ul className="mt-5 space-y-2">
                  {o.includes.map((x) => (
                    <li key={x} className="flex gap-2.5 text-[15px] text-dim leading-relaxed">
                      <span className="text-acid shrink-0">▸</span>
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 pt-5 border-t border-line/70">
                  <div className="kicker mb-2">Not included</div>
                  <p className="text-[14px] text-dim leading-relaxed">{o.notIncluded}</p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={`mailto:${LINKS.email}?subject=${encodeURIComponent(o.name)}&body=${encodeURIComponent(
                      `Hi Aman,\n\nI'd like to go ahead with "${o.name}" (${inr(o.price)}).\n\nDomain / system:\n\nAnything you should know first:\n\n`,
                    )}`}
                    className="rounded-lg bg-acid text-void font-semibold px-5 py-2.5 text-sm hover:bg-acid/85 transition-colors"
                  >
                    Start this →
                  </a>
                  <a
                    href={BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-line px-5 py-2.5 text-sm text-dim hover:text-ink hover:border-dim transition-colors"
                  >
                    15 minutes first
                  </a>
                </div>
              </section>
            ))}
          </div>

          <div className="mt-14 pt-8 border-t border-line space-y-4 text-[15px] text-dim leading-relaxed">
            <p>
              <span className="text-ink font-medium">How payment works.</span> Half up front,
              half on delivery, invoiced. No retainer, no minimum, no subscription. If the
              work turns out smaller than quoted, the price comes down — it does not go up
              mid-job.
            </p>
            <p>
              <span className="text-ink font-medium">If it isn&apos;t right.</span> The
              headers job has a stated pass mark, and if it doesn&apos;t hit it you
              don&apos;t pay. The other two are judgement work rather than a score, so
              instead: tell me it fell short and I&apos;ll either fix it or refund it. I
              would rather do that than argue with someone who is going to tell other people
              about it either way.
            </p>
            <p>
              <span className="text-ink font-medium">Not sure which?</span> Run the{" "}
              <Link href="/tools" className="text-acid hover:underline">
                free checks
              </Link>{" "}
              first — they will tell you whether you have any of these problems before you
              spend anything. If they come back clean, that is your answer and I&apos;ll say
              so.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
