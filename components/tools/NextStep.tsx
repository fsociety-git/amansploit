"use client";

import Link from "next/link";
import { offerBySlug, inr } from "@/lib/offers";
import { BOOKING_URL, LINKS } from "@/lib/data";

/**
 * What to do next, decided by what the scan actually found.
 *
 * The rule that makes this worth trusting: when a result comes back clean, this
 * offers nothing. A tool that finds a way to sell you something regardless of
 * the answer is an advert with a text box, and people can tell. Saying "there
 * is nothing to fix here" is the single most persuasive thing this component
 * ever does, precisely because it costs a sale.
 *
 * It also refuses to sell on an inconclusive result. A blocked or unanswered
 * scan is not evidence of a problem, and pitching against it would be selling
 * fear rather than a finding.
 */

type Severity = "bad" | "middling" | "good" | "unknown";

const PITCH: Record<
  Severity,
  { kicker: string; tone: string; border: string } | null
> = {
  bad: { kicker: "WORTH FIXING NOW", tone: "text-red-400", border: "border-red-500/40" },
  middling: { kicker: "WORTH TIGHTENING", tone: "text-yellow-400", border: "border-yellow-500/35" },
  good: null,
  unknown: null,
};

export default function NextStep({
  severity,
  offerSlug,
  problem,
}: {
  severity: Severity;
  offerSlug: string;
  /** One sentence naming what was found, in the buyer's terms. */
  problem?: string;
}) {
  const offer = offerBySlug(offerSlug);
  const pitch = PITCH[severity];

  // Clean result — say so and sell nothing.
  if (severity === "good") {
    return (
      <div className="mt-6 card-line rounded-xl p-6 border-acid/30">
        <div className="kicker mb-2 text-acid">NOTHING TO SELL YOU</div>
        <p className="text-[15px] text-dim leading-relaxed">
          This came back clean, so there is no work here worth paying me for. If you want a
          second opinion on something this check doesn&apos;t cover — authorisation logic,
          your API, anything with a login in front of it — that is a{" "}
          <Link href="/#estimate" className="text-acid hover:underline">
            different conversation
          </Link>
          , and I&apos;ll tell you honestly whether you need one.
        </p>
      </div>
    );
  }

  // Inconclusive — no finding, so no pitch.
  if (severity === "unknown" || !offer || !pitch) {
    return (
      <div className="mt-6 card-line rounded-xl p-6">
        <div className="kicker mb-2">INCONCLUSIVE</div>
        <p className="text-[15px] text-dim leading-relaxed">
          This didn&apos;t return enough to judge, and I&apos;m not going to sell you
          something on the strength of a result I can&apos;t stand behind. Try again, or{" "}
          <a href={`mailto:${LINKS.email}`} className="text-acid hover:underline">
            send me the domain
          </a>{" "}
          and I&apos;ll look at it properly.
        </p>
      </div>
    );
  }

  return (
    <div className={`mt-6 card-line rounded-xl p-6 md:p-7 ${pitch.border}`}>
      <div className={`kicker mb-2 ${pitch.tone}`}>{pitch.kicker}</div>
      {problem && <p className="text-[15px] text-ink leading-relaxed">{problem}</p>}

      <div className="mt-5 pt-5 border-t border-line/70">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="font-display font-bold text-xl">{offer.name}</h3>
          <div className="font-mono text-sm">
            <span className="text-acid font-bold">{inr(offer.price)}</span>
            <span className="text-dim"> fixed · {offer.turnaround}</span>
          </div>
        </div>

        <ul className="mt-4 space-y-1.5">
          {offer.includes.slice(0, 3).map((x) => (
            <li key={x} className="flex gap-2.5 text-[14px] text-dim leading-relaxed">
              <span className="text-acid shrink-0">▸</span>
              <span>{x}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={`/fix#${offer.slug}`}
            className="rounded-lg bg-acid text-void font-semibold px-5 py-2.5 text-sm hover:bg-acid/85 transition-colors"
          >
            What&apos;s included →
          </Link>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-line px-5 py-2.5 text-sm text-dim hover:text-ink hover:border-dim transition-colors"
          >
            Ask me a question first
          </a>
        </div>

        <p className="mt-4 text-[13px] text-dim/80 leading-relaxed">
          Or ignore all of this and fix it yourself — the exact records are above, and the{" "}
          <Link href="/blog" className="text-acid/80 hover:underline">
            writing
          </Link>{" "}
          explains the reasoning. It&apos;s genuinely an afternoon&apos;s work for whoever
          runs your DNS.
        </p>
      </div>
    </div>
  );
}
