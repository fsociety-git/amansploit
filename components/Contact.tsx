"use client";

import Reveal from "./Reveal";
import { BOOKING_URL, LINKS, WHATSAPP } from "@/lib/data";

export default function Contact() {
  return (
    <section id="contact" className="relative scroll-mt-16 min-h-screen flex items-center">
      <div className="relative mx-auto max-w-6xl px-5 py-28 text-center w-full">
        <Reveal>
          <div className="kicker mb-4">// START A PROJECT</div>
          <h2 className="font-display font-bold text-[clamp(2.2rem,6vw,4.5rem)] tracking-tight leading-[0.98]">
            Got something that needs to be <br className="hidden sm:block" />
            <span className="text-acid text-glow">built or broken?</span>
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-dim text-lg">
            Tell me what you&apos;re working on. I reply within 24 hours with honest
            scope and a fixed quote — no sales calls, no fluff.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`mailto:${LINKS.email}?subject=Project%20inquiry`}
              className="group rounded-lg bg-acid text-void font-semibold px-7 py-3.5 hover:bg-acid/85 transition-all hover:shadow-[0_0_40px_-6px_rgba(45,224,179,0.6)]"
            >
              {LINKS.email}
              <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-line text-ink font-medium px-7 py-3.5 hover:border-acid/50 hover:text-acid transition-colors"
            >
              Message on WhatsApp
            </a>
            {BOOKING_URL && (
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-line text-ink font-medium px-7 py-3.5 hover:border-acid/50 hover:text-acid transition-colors"
              >
                Book a 15-min call
              </a>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <p className="mt-8 font-mono text-xs text-dim">
            {LINKS.location} ·{" "}
            <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-acid transition-colors">
              LinkedIn
            </a>
          </p>
          <p className="mt-2 font-mono text-[11px] text-dim/70">
            Not sure what you need? Use the{" "}
            <a href="#estimate" className="text-acid hover:underline">scope estimator</a> first.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
