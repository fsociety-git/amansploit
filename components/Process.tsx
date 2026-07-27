"use client";

import Reveal from "./Reveal";
import { PROCESS } from "@/lib/data";

export default function Process() {
  return (
    <section id="process" className="relative scroll-mt-16">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <div className="kicker mb-3">// HOW IT WORKS</div>
          <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight max-w-2xl">
            A clear engagement. No surprises.
          </h2>
        </Reveal>

        <div className="mt-14 grid md:grid-cols-4 gap-6">
          {PROCESS.map((p, i) => (
            <Reveal key={p.step} delay={i * 0.1}>
              <div className="relative">
                <div className="font-display font-bold text-6xl text-acid/15">{p.step}</div>
                <h3 className="mt-2 font-display font-bold text-xl">{p.title}</h3>
                <p className="mt-2 text-sm text-dim leading-relaxed">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
