"use client";

import Reveal from "./Reveal";
import { AFFILIATIONS, CREDENTIALS } from "@/lib/data";

/**
 * Trust without a face.
 *
 * Freelance sites usually build credibility with a photo and a video. This one
 * does it with voice and specifics instead: what you actually get, what I will
 * turn down, and what happens if I am wrong. Security buyers respond to
 * precision more than portraits.
 */
const PROMISES = [
  {
    h: "You work with me. Not a team you never meet.",
    p: "The person who scopes your engagement is the person who tests it and the person who writes the report. Nothing is handed to a junior, and nothing is subcontracted without telling you first.",
  },
  {
    h: "A fixed quote before anything starts.",
    p: "You get a scope, a price, and a delivery date up front. If the work turns out to be smaller than expected, the price comes down. It does not go up mid-engagement.",
  },
  {
    h: "The retest is included.",
    p: "Finding problems is the easy half. After you fix things, I test them again at no extra cost — because an engagement that ends with an unverified fix has not actually reduced your risk.",
  },
  {
    h: "I will tell you when you do not need me.",
    p: "If a scan would answer your question, or the real problem is a configuration you can change this afternoon, I will say so. That is worth more to both of us than an invoice.",
  },
  {
    h: "Your data stays yours.",
    p: "Findings are stored as evidence, not as copies of your data. Secrets and personal information get masked at capture. Everything is deleted on request when the engagement closes.",
  },
];

export default function WorkingWithMe() {
  return (
    <section id="working-with-me" className="relative scroll-mt-16 border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <div className="kicker mb-3">// WORKING WITH ME</div>
          <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight max-w-2xl">
            What you&apos;re actually buying.
          </h2>
          <p className="mt-4 max-w-2xl text-dim leading-relaxed">
            Hiring a freelance security engineer is mostly an exercise in trust — you are
            paying someone to find the things you could not. Here is exactly how I work, so
            you can decide before we ever get on a call.
          </p>
        </Reveal>

        <div className="mt-12 grid md:grid-cols-2 gap-x-10 gap-y-8">
          {PROMISES.map((x, i) => (
            <Reveal key={x.h} delay={i * 0.06}>
              <div className="border-l-2 border-acid/40 pl-5">
                <h3 className="font-display font-bold text-lg leading-snug">{x.h}</h3>
                <p className="mt-2 text-[15px] text-dim leading-relaxed">{x.p}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* credentials + where the work has happened */}
        <Reveal delay={0.1}>
          <div className="mt-16 pt-10 border-t border-line/70 grid md:grid-cols-2 gap-10">
            <div>
              <div className="font-mono text-xs text-dim uppercase tracking-wider mb-4">
                Credentials
              </div>
              <ul className="space-y-2">
                {CREDENTIALS.map((c) => (
                  <li key={c.name} className="flex items-baseline gap-2 text-[15px]">
                    <span className="text-acid">▸</span>
                    <span className="text-ink">{c.name}</span>
                    <span className="text-dim text-sm">— {c.issuer}</span>
                    {c.verify && (
                      <a
                        href={c.verify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[11px] text-acid hover:underline"
                      >
                        verify
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-mono text-xs text-dim uppercase tracking-wider mb-4">
                Experience &amp; education
              </div>
              <div className="flex flex-wrap gap-2">
                {AFFILIATIONS.map((a) => (
                  <span
                    key={a}
                    className="font-mono text-xs text-dim border border-line rounded-full px-3.5 py-1.5"
                  >
                    {a}
                  </span>
                ))}
              </div>
              <p className="mt-5 text-sm text-dim leading-relaxed">
                Currently a Security Analyst building multi-client SOC tooling, on the AWS
                cloud-security track, and available for freelance engagements alongside it.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
