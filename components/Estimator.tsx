"use client";

import { useMemo, useState } from "react";
import Reveal from "./Reveal";
import { ESTIMATOR, LINKS, WHATSAPP } from "@/lib/data";

/**
 * Scope estimator that doubles as the intake step.
 *
 * Rather than a contact form that needs a mail service, an inbox, and a
 * deliverability story, this qualifies the lead in the browser and hands off a
 * fully-written scope to WhatsApp or email. Fewer moving parts, nothing to
 * leak, and the prospect arrives having already told you what they need.
 */
/** Round to the nearest thousand — an estimate should not look like a quote. */
const inr = (n: number) =>
  "₹" + (Math.round(n / 1000) * 1000).toLocaleString("en-IN");

export default function Estimator() {
  const [scope, setScope] = useState(ESTIMATOR.scope[1].id);
  const [size, setSize] = useState(ESTIMATOR.size[1].id);
  const [extras, setExtras] = useState<string[]>([]);

  const toggle = (id: string) =>
    setExtras((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));

  const calc = useMemo(() => {
    const s = ESTIMATOR.scope.find((x) => x.id === scope)!;
    const z = ESTIMATOR.size.find((x) => x.id === size)!;
    let inrTotal = s.base * z.mult;
    let usdTotal = s.usd * z.mult;
    for (const e of ESTIMATOR.extras) {
      if (!extras.includes(e.id)) continue;
      if ("add" in e && e.add) {
        inrTotal += e.add;
        usdTotal += e.usd ?? 0;
      }
      if ("mult" in e && e.mult) {
        inrTotal *= e.mult;
        usdTotal *= e.mult;
      }
    }
    const days = Math.round(5 * z.mult + (extras.includes("threat") ? 2 : 0));
    return {
      low: inrTotal,
      high: inrTotal * 1.35,
      usdLow: usdTotal,
      usdHigh: usdTotal * 1.35,
      days,
      label: s.label,
      sizeLabel: z.label,
    };
  }, [scope, size, extras]);

  const message = useMemo(() => {
    const chosen = ESTIMATOR.extras
      .filter((e) => extras.includes(e.id))
      .map((e) => e.label);
    return [
      "Hi Aman — I'd like a security assessment.",
      "",
      `Scope: ${calc.label}`,
      `Size: ${calc.sizeLabel}`,
      chosen.length ? `Add-ons: ${chosen.join(", ")}` : "Add-ons: none",
      `Indicative estimate from your site: ${inr(calc.low)}–${inr(calc.high)} (~${calc.days} days)`,
      "",
      "A bit about the target:",
      "",
    ].join("\n");
  }, [calc, extras]);

  const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
  const mail = `mailto:${LINKS.email}?subject=${encodeURIComponent(
    "Security assessment enquiry",
  )}&body=${encodeURIComponent(message)}`;

  const pill = (active: boolean) =>
    `text-left rounded-lg border px-4 py-3 text-sm transition-colors ${
      active
        ? "border-acid/60 bg-acid/10 text-ink"
        : "border-line text-dim hover:border-acid/30 hover:text-ink"
    }`;

  return (
    <section id="estimate" className="relative scroll-mt-16 border-t border-line bg-panel/40">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <div className="kicker mb-3">// SCOPE &amp; ESTIMATE</div>
          <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight max-w-2xl">
            Get a number before you talk to anyone.
          </h2>
          <p className="mt-4 max-w-2xl text-dim leading-relaxed">
            Pick what you have. You get an indicative range and timeline immediately, and
            can send the scope straight to me — no form, no follow-up sequence, no call
            required to find out roughly what this costs.
          </p>
        </Reveal>

        <div className="mt-12 grid lg:grid-cols-[1.3fr_1fr] gap-8">
          {/* controls */}
          <Reveal>
            <div className="space-y-7">
              <div>
                <div className="font-mono text-xs text-dim uppercase tracking-wider mb-3">
                  1 · What needs testing
                </div>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {ESTIMATOR.scope.map((s) => (
                    <button key={s.id} onClick={() => setScope(s.id)} className={pill(scope === s.id)}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-mono text-xs text-dim uppercase tracking-wider mb-3">
                  2 · How big is it
                </div>
                <div className="grid gap-2.5">
                  {ESTIMATOR.size.map((s) => (
                    <button key={s.id} onClick={() => setSize(s.id)} className={pill(size === s.id)}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-mono text-xs text-dim uppercase tracking-wider mb-3">
                  3 · Anything else
                </div>
                <div className="grid sm:grid-cols-3 gap-2.5">
                  {ESTIMATOR.extras.map((e) => (
                    <button key={e.id} onClick={() => toggle(e.id)} className={pill(extras.includes(e.id))}>
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* result */}
          <Reveal delay={0.1}>
            <div className="card-line rounded-xl p-7 lg:sticky lg:top-20">
              <div className="font-mono text-xs text-dim uppercase tracking-wider">
                Indicative range
              </div>
              <div className="mt-2 font-display font-bold text-3xl md:text-4xl tracking-tight text-acid">
                {inr(calc.low)} – {inr(calc.high)}
              </div>
              <div className="mt-1 font-mono text-xs text-dim">
                ≈ ${Math.round(calc.usdLow).toLocaleString()} – $
                {Math.round(calc.usdHigh).toLocaleString()} · about {calc.days} working days
              </div>

              <p className="mt-5 text-sm text-dim leading-relaxed">
                An estimate, not a quote — the real number comes after a short scoping
                conversation, and it is fixed before any work starts.
              </p>

              <div className="mt-6 space-y-2.5">
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center rounded-lg bg-acid text-void font-semibold px-5 py-3 hover:bg-acid/85 transition-colors"
                >
                  Send this scope on WhatsApp
                </a>
                <a
                  href={mail}
                  className="block text-center rounded-lg border border-line text-ink font-medium px-5 py-3 hover:border-acid/50 hover:text-acid transition-colors"
                >
                  Send it by email instead
                </a>
              </div>

              <p className="mt-4 font-mono text-[11px] text-dim text-center">
                Replies within 24 hours, usually sooner.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
