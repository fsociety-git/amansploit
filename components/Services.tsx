"use client";

import Reveal from "./Reveal";
import { SERVICES } from "@/lib/data";

export default function Services() {
  return (
    <section id="services" className="relative scroll-mt-16">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <div className="kicker mb-3">// SERVICES</div>
          <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight max-w-2xl">
            Hire the person who <span className="text-acid">attacks</span> systems to build yours.
          </h2>
          <p className="mt-4 max-w-2xl text-dim">
            Four ways to engage. Every one ends with a deliverable you can act on — not a
            slide deck of vague advice.
          </p>
        </Reveal>

        <div className="mt-14 grid md:grid-cols-2 gap-6">
          {SERVICES.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.08}>
              <div className="card-line card-hover rounded-xl p-7 h-full flex flex-col">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-acid/70 text-sm">{s.id}</span>
                  <span className="font-mono text-[10px] text-dim/60 hidden sm:block">{s.tag}</span>
                </div>
                <h3 className="mt-4 font-display font-bold text-2xl">{s.title}</h3>
                <p className="mt-3 text-dim leading-relaxed text-[15px]">{s.desc}</p>
                <ul className="mt-5 space-y-2 pt-4 border-t border-line/70">
                  {s.deliverables.map((d) => (
                    <li key={d} className="flex gap-2.5 text-sm text-ink/90">
                      <span className="text-acid mt-0.5">▸</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
