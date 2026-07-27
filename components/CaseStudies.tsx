"use client";

import Link from "next/link";
import Reveal from "./Reveal";
import { CASES } from "@/lib/data";

export default function CaseStudies() {
  return (
    <section id="work" className="relative scroll-mt-16 border-t border-line bg-panel/40">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <div className="kicker mb-3">// SELECTED WORK</div>
          <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight max-w-2xl">
            Proof, not promises.
          </h2>
        </Reveal>

        <div className="mt-14 space-y-6">
          {CASES.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.05}>
              <Link href={`/work/${c.slug}`} className="block">
              <article className="card-line card-hover rounded-xl p-7 md:p-9 grid md:grid-cols-[1fr_1.6fr] gap-7">
                <div>
                  <div className="kicker">{c.kicker}</div>
                  <h3 className="mt-3 font-display font-bold text-2xl md:text-[1.7rem] leading-tight">
                    {c.title}
                  </h3>
                  <div className="mt-4 font-mono text-xs text-acid">read the case study →</div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {c.stack.map((t) => (
                      <span
                        key={t}
                        className="font-mono text-[10px] text-acid/80 border border-acid/25 rounded px-2 py-0.5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-4 text-[15px] leading-relaxed">
                  <p>
                    <span className="font-mono text-xs text-dim uppercase tracking-wider block mb-1">Problem</span>
                    <span className="text-dim">{c.problem}</span>
                  </p>
                  <p>
                    <span className="font-mono text-xs text-dim uppercase tracking-wider block mb-1">Built</span>
                    <span className="text-ink/90">{c.build}</span>
                  </p>
                  <p className="border-l-2 border-acid pl-4">
                    <span className="font-mono text-xs text-acid uppercase tracking-wider block mb-1">Result</span>
                    <span className="text-ink">{c.result}</span>
                  </p>
                </div>
              </article>
            </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
