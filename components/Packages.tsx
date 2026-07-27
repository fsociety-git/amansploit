"use client";

import Reveal from "./Reveal";
import { PACKAGES } from "@/lib/data";

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

export default function Packages() {
  return (
    <section id="pricing" className="relative scroll-mt-16 border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <div className="kicker mb-3">// ENGAGEMENTS</div>
          <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight max-w-2xl">
            Clear scope, fixed price.
          </h2>
          <p className="mt-4 max-w-2xl text-dim leading-relaxed">
            Starting points, not a menu you have to fit into. Every engagement is quoted
            after a short scoping conversation — but you should know the rough shape before
            you spend time on a call.
          </p>
        </Reveal>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {PACKAGES.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08}>
              <div
                className={`card-line card-hover rounded-xl p-7 h-full flex flex-col ${
                  p.featured ? "border-acid/45" : ""
                }`}
              >
                {p.featured && (
                  <div className="kicker mb-3">Most common</div>
                )}
                <h3 className="font-display font-bold text-xl">{p.name}</h3>
                <p className="mt-1.5 text-sm text-dim">{p.best}</p>

                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="font-mono text-xs text-dim">from</span>
                  <span className="font-display font-bold text-3xl text-acid">
                    {inr(p.from)}
                  </span>
                  {p.unit && <span className="font-mono text-xs text-dim">{p.unit}</span>}
                </div>
                <div className="mt-1 font-mono text-[11px] text-dim">
                  ≈ ${p.usd.toLocaleString()}{p.unit ?? ""} · {p.duration}
                </div>

                <ul className="mt-6 space-y-2 pt-5 border-t border-line/70 flex-1">
                  {p.includes.map((x) => (
                    <li key={x} className="flex gap-2.5 text-sm text-ink/90">
                      <span className="text-acid mt-0.5 shrink-0">▸</span>
                      {x}
                    </li>
                  ))}
                </ul>

                <a
                  href="#estimate"
                  className={`mt-6 block text-center rounded-lg px-5 py-2.5 font-medium transition-colors ${
                    p.featured
                      ? "bg-acid text-void hover:bg-acid/85"
                      : "border border-line text-ink hover:border-acid/50 hover:text-acid"
                  }`}
                >
                  Estimate my scope
                </a>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-10 card-line rounded-xl p-6 max-w-3xl">
            <div className="kicker mb-2">Introductory rates</div>
            <p className="text-[15px] text-dim leading-relaxed">
              These are roughly half the going rate for methodology-driven testing in India,
              because I&apos;m building my independent client list. What you get is not
              reduced — every engagement is hands-on testing with a written report and a
              free retest, never a scanner export with a logo on it. These rates will rise
              as the calendar fills, and anyone who starts on them keeps them.
            </p>
            <p className="mt-3 text-[15px] text-dim leading-relaxed">
              Non-profit, pre-revenue startup, or student project? Say so — the price moves
              again.
            </p>
            <a
              href="/sample-penetration-test-report.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-acid/40 text-acid font-medium px-5 py-2.5 hover:bg-acid/10 transition-colors"
            >
              Read a sample report (PDF)
              <span className="font-mono text-xs">↓</span>
            </a>
            <p className="mt-2 font-mono text-[11px] text-dim/70">
              12 pages, fictional target — so you can judge the writing before you commit.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
