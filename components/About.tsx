"use client";

import Reveal from "./Reveal";
import DecryptText from "./DecryptText";

const WHOAMI = [
  "> whoami",
  "Aman Sonkamble — offensive security background, builds the things he breaks.",
  "",
  "> specialties",
  "offensive security · security automation · secure full-stack · applied AI/ML",
  "",
  "> current",
  "Independent. Building secure web applications, automation and security",
  "tooling. Top 1% on TryHackMe. Shipping software that assumes it will be",
  "attacked.",
  "",
  "> philosophy",
  "Certs open doors. Evidence gets you hired. Everything I claim, I can show.",
];

export default function About() {
  return (
    <section id="about" className="relative scroll-mt-16 border-t border-line bg-panel/40">
      <div className="mx-auto max-w-6xl px-5 py-24 grid md:grid-cols-2 gap-14 items-center">
        <Reveal>
          <div className="kicker mb-3">// ABOUT</div>
          <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight leading-[1.05]">
            The person you actually want on a hard problem.
          </h2>
          <p className="mt-6 text-dim leading-relaxed">
            Most security freelancers either break things or build them. I do both — which
            means when I test your app, I understand the code underneath it, and when I
            build your app, I already know how it gets attacked.
          </p>
          <p className="mt-4 text-dim leading-relaxed">
            I work with startups, MSSPs, and product teams who want senior-grade work
            without a senior-grade headcount. Clear scope, honest reporting, and deliverables
            your team can use the day I hand them over.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="card-line rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-line">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 font-mono text-xs text-dim">aman@sec: ~</span>
            </div>
            <div className="p-5 font-mono text-[13px] leading-relaxed">
              {WHOAMI.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.startsWith(">")
                      ? "text-acid"
                      : line === ""
                      ? "h-3"
                      : "text-ink/85"
                  }
                >
                  {line.startsWith(">") ? (
                    <DecryptText text={line} delay={i * 90} />
                  ) : (
                    line
                  )}
                </div>
              ))}
              <div className="text-acid caret mt-1">&nbsp;</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
