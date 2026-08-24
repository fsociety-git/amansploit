"use client";

/**
 * The exit ramp for image-based abuse.
 *
 * Shield deliberately does not handle this. A mass-report link is the wrong
 * instrument — it mobilises an audience toward the content, and it cannot do the
 * one thing that actually helps, which is blocking the image across platforms at
 * once. StopNCII and Take It Down both hash on the victim's own device, so the
 * image never leaves their phone; nothing Shield could build would beat that.
 *
 * The age split is not a detail. StopNCII requires the person to have been 18 or
 * over in the image; under-18s must use NCMEC's Take It Down, because the legal
 * framework for that material is entirely different. Routing a minor to the
 * wrong service is the worst error this screen could make, so both are shown
 * with the condition stated before the link rather than after it.
 */
export default function NCIIRoute({ s, onBack }: { s: Record<string, string>; onBack: () => void }) {
  const blocks = [
    { t: s.adult, d: s.adultD, href: "https://stopncii.org", cta: "StopNCII.org" },
    { t: s.minor, d: s.minorD, href: "https://takeitdown.ncmec.org", cta: "takeitdown.ncmec.org" },
    { t: s.money, d: s.moneyD, href: "tel:1930", cta: "1930" },
    { t: s.keep, d: s.keepD },
  ];

  return (
    <div className="mt-6">
      <h1 className="font-display font-bold text-2xl leading-snug">{s.title}</h1>
      <p className="mt-3 text-[16px] leading-relaxed text-dim">{s.sub}</p>

      <div className="mt-7 space-y-3">
        {blocks.map((b) => (
          <section key={b.t} className="card p-5">
            <h2 className="font-display font-bold text-[16px] leading-snug">{b.t}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-dim">{b.d}</p>
            {b.href && (
              <a href={b.href} target={b.href.startsWith("tel:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="tap mt-3 w-full rounded-xl bg-acid px-5 py-3 font-semibold text-void">
                {b.cta}
              </a>
            )}
          </section>
        ))}
      </div>

      <p className="mt-7 rounded-xl border border-acid/30 bg-acid/[0.05] px-5 py-4 text-[15px] leading-relaxed text-ink">
        {s.notFault}
      </p>

      <button onClick={onBack} className="tap mt-6 w-full rounded-xl border border-line px-5 py-3 text-[15px] text-dim">
        {s.back}
      </button>
    </div>
  );
}
