"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import DecryptText from "./DecryptText";
import Counter from "./Counter";
import { CERTS, STATS } from "@/lib/data";

/**
 * Act I — the cinematic opening.
 *
 * A tall scroll driver (#act1) whose progress also feeds the particle canvas
 * (see experience/progress.ts). Three overlay beats cross-fade as the particles
 * morph sphere → DNA → wave.
 *
 * Beat opacity is driven by a single rAF loop writing styles directly, rather
 * than Framer's `useScroll`: the sticky first beat made its measurement
 * disagree with the fixed ones, which desynced the overlays from the canvas.
 * Reading the same rect the shader reads keeps them locked by construction.
 */

/** Trapezoid envelope: 0 → 1 across [a,b], hold, 1 → 0 across [c,d]. */
function band(p: number, a: number, b: number, c: number, d: number) {
  if (p <= a || p >= d) return 0;
  if (p < b) return (p - a) / (b - a);
  if (p <= c) return 1;
  return 1 - (p - c) / (d - c);
}

export default function ActOne() {
  const heroRef = useRef<HTMLElement>(null);
  const posRef = useRef<HTMLElement>(null);
  const statRef = useRef<HTMLElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsFired = useRef(false);

  useEffect(() => {
    let raf = 0;
    const apply = (el: HTMLElement | null, o: number, y: number) => {
      if (!el) return;
      el.style.opacity = String(o);
      el.style.transform = `translate3d(0, ${y}px, 0)`;
      el.style.visibility = o < 0.01 ? "hidden" : "visible";
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const act = document.getElementById("act1");
      if (!act) return;
      const r = act.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      if (span <= 0) return;
      const p = Math.min(Math.max(-r.top / span, 0), 1);

      // beat 1 — hero: visible from the top, gone by 22%
      const hero = p < 0.14 ? 1 : Math.max(0, 1 - (p - 0.14) / 0.08);
      apply(heroRef.current, hero, -60 * Math.min(p / 0.22, 1));
      if (hintRef.current) hintRef.current.style.opacity = String(hero);

      // beat 2 — positioning statement
      const pos = band(p, 0.26, 0.34, 0.5, 0.58);
      apply(posRef.current, pos, 40 - 80 * Math.min(Math.max((p - 0.26) / 0.32, 0), 1));

      // beat 3 — stats
      const st = band(p, 0.62, 0.72, 0.94, 1);
      if (st > 0.05 && !statsFired.current) {
        statsFired.current = true;
        setStatsVisible(true); // start the count-up only once the beat is on screen
      }
      apply(statRef.current, st, 40 - 70 * Math.min(Math.max((p - 0.62) / 0.38, 0), 1));
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div id="act1" className="relative h-[300vh] md:h-[420vh]">
      {/* Scrim: above the WebGL canvas (-z-10), below content — so the particle
          ring reads as atmosphere instead of competing with copy. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-[5]"
        style={{
          background:
            "linear-gradient(100deg, rgba(7,10,14,0.93) 0%, rgba(7,10,14,0.82) 34%, rgba(7,10,14,0.45) 62%, rgba(7,10,14,0.15) 100%), radial-gradient(ellipse 80% 70% at 50% 50%, rgba(7,10,14,0.55), transparent 75%)",
        }}
      />

      {/* ---------- beat 1: hero ---------- */}
      <section
        ref={heroRef}
        className="pointer-events-none sticky top-0 h-[100svh] flex flex-col justify-center px-5 pt-14"
      >
        <div className="pointer-events-auto mx-auto w-full max-w-6xl">
          <motion.div
            className="inline-flex items-center gap-2.5 rounded-full border border-line bg-panel/60 backdrop-blur px-3.5 py-1.5 mb-5 sm:mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <span className="pulse-dot h-2 w-2 rounded-full bg-acid" />
            <span className="font-mono text-xs text-dim">
              AVAILABLE FOR ENGAGEMENTS — <span className="text-acid">Q3 2026</span>
            </span>
          </motion.div>

          <h1 className="font-display font-bold leading-[0.95] text-[clamp(2rem,8vw,6.2rem)] tracking-tight">
            <DecryptText text="I BREAK THINGS" as="span" className="block" delay={400} />
            <DecryptText
              text="TO BUILD THEM SAFER."
              as="span"
              className="block text-acid text-glow"
              delay={850}
            />
          </h1>

          <motion.p
            className="mt-4 sm:mt-7 max-w-2xl text-[15px] sm:text-lg text-dim leading-relaxed"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.7 }}
          >
            I&apos;m <span className="text-ink font-medium">Aman Sonkamble</span> — a security
            engineer and full-stack developer. I penetration-test web apps and APIs, build
            security automation that catches real incidents, and ship software that assumes
            it will be attacked.
          </motion.p>

          <motion.div
            className="mt-6 sm:mt-9 flex flex-wrap items-center gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.75, duration: 0.7 }}
          >
            <a
              href="#contact"
              className="group rounded-lg bg-acid text-void font-semibold px-6 py-3 hover:bg-acid/85 transition-all hover:shadow-[0_0_36px_-6px_rgba(45,224,179,0.6)]"
            >
              Get a security assessment
              <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#work"
              className="rounded-lg border border-line bg-void/40 backdrop-blur text-ink font-medium px-6 py-3 hover:border-acid/50 hover:text-acid transition-colors"
            >
              See the work
            </a>
          </motion.div>

          <motion.div
            className="mt-7 sm:mt-12 flex flex-wrap gap-2 sm:gap-2.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.1, duration: 0.8 }}
          >
            {CERTS.map((c, i) => (
              <span
                key={c}
                className={`font-mono text-[11px] text-dim border border-line rounded-full px-3 py-1 bg-panel/50 backdrop-blur-sm ${
                  i >= 4 ? "hidden sm:inline-flex" : ""
                }`}
              >
                {c}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---------- beat 2: positioning ---------- */}
      <section
        ref={posRef}
        style={{ opacity: 0, visibility: "hidden" }}
        className="pointer-events-none fixed inset-0 flex items-center justify-center px-5"
      >
        <p className="max-w-3xl text-center font-display font-bold text-[clamp(1.6rem,4.2vw,3rem)] leading-[1.15] tracking-tight">
          Most freelancers <span className="text-dim">either</span> break things{" "}
          <span className="text-dim">or</span> build them.
          <br />
          <span className="text-acid text-glow">I do both.</span>
        </p>
      </section>

      {/* ---------- beat 3: stats ---------- */}
      <section
        ref={statRef}
        style={{ opacity: 0, visibility: "hidden" }}
        className="pointer-events-none fixed inset-0 flex items-center justify-center px-5"
      >
        <div className="mx-auto w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="font-display font-bold text-4xl md:text-5xl text-ink">
                <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} play={statsVisible} />
              </div>
              <div className="mt-2 font-mono text-[11px] text-dim uppercase tracking-wider">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* scroll hint, first screen only */}
      <div
        ref={hintRef}
        className="pointer-events-none fixed bottom-8 inset-x-0 hidden sm:block text-center font-mono text-xs text-dim/70"
        aria-hidden="true"
      >
        scroll ↓ · or press <span className="text-acid">⌘K</span>
      </div>
    </div>
  );
}
