"use client";

import Reveal from "./Reveal";
import { ORGS } from "@/lib/data";

/**
 * The credibility strip.
 *
 * The plan called this "trusted by". It isn't, and calling it that would be the
 * one dishonest thing on the page: an employer, an internship, two universities
 * and two certifying bodies are not customers. A strip of institution names
 * under a "trusted by" heading is read as a client list by everyone who has
 * seen a SaaS homepage, and the first prospect who asks "so what did you do for
 * Coventry?" gets an answer that damages more than the strip ever earned.
 *
 * So each entry states its own relationship. That is a weaker claim and a
 * stronger position — it survives being checked, which the other version does
 * not. When there are real clients and permission to name them, that becomes a
 * separate strip that has genuinely earned the heading.
 *
 * The marks are typographic monograms in the site's own fonts rather than the
 * organisations' logos: shipping third-party trademark files on a commercial
 * site needs permission nobody has asked for, and a row of mismatched logos
 * looks assembled rather than designed.
 */
export default function Credibility() {
  return (
    <section
      aria-label="Employment, education and certification"
      className="relative border-t border-line"
    >
      <div className="mx-auto max-w-6xl px-5 py-16">
        <Reveal>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <div className="kicker">// WHERE THE WORK COMES FROM</div>
            <p className="font-mono text-[11px] text-dim/70">
              employer · internship · degrees · certifications — not a client list
            </p>
          </div>
        </Reveal>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {ORGS.map((o, i) => (
            <Reveal key={o.name} delay={i * 0.05}>
              <div className="group h-full card-line rounded-xl p-4 flex flex-col items-center text-center transition-colors hover:border-acid/40">
                <div
                  aria-hidden
                  className="grid place-items-center h-12 w-12 rounded-lg border border-line bg-void/60 font-display font-bold text-[15px] tracking-tight text-dim transition-colors group-hover:text-acid group-hover:border-acid/40"
                >
                  {o.mark}
                </div>
                <div className="mt-3 font-medium text-[13px] leading-snug text-ink">{o.name}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-acid/70">
                  {o.relationship}
                </div>
                <div className="mt-1.5 text-[11px] leading-snug text-dim">{o.detail}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
