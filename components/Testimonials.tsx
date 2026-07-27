"use client";

import Reveal from "./Reveal";
import { TESTIMONIALS } from "@/lib/data";

/**
 * Renders nothing until real, permissioned client quotes exist in
 * lib/data.ts. An empty section is better than an invented one — a fake
 * testimonial on a security consultant's site is the fastest way to lose a
 * technical buyer who bothers to check.
 */
export default function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section className="relative border-t border-line bg-panel/40">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <div className="kicker mb-8">// WHAT CLIENTS SAY</div>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <figure className="card-line rounded-xl p-7 h-full">
                <blockquote className="text-lg leading-relaxed text-ink">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-5 font-mono text-xs text-dim">
                  {t.name} — {t.role}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
