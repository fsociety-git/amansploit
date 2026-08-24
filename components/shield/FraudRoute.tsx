"use client";

/**
 * Shown the moment "asking people for money" is selected, before the rest of the
 * wizard. If money has already moved, the first hours decide whether it can be
 * frozen — so this cannot wait until the dashboard three screens later.
 */
export default function FraudRoute({ s, onContinue }: { s: Record<string, string>; onContinue: () => void }) {
  const blocks = [
    { t: s.call, d: s.callD, href: "tel:1930", cta: s.call },
    { t: s.portal, d: s.portalD, href: "https://cybercrime.gov.in", cta: "cybercrime.gov.in" },
    { t: s.warn, d: s.warnD },
  ];

  return (
    <div className="mt-6">
      <div className="rounded-xl border border-[#ff6b6b]/45 bg-[#ff6b6b]/[0.07] px-5 py-5">
        <h1 className="font-display font-bold text-xl leading-snug text-[#ff8a8a]">{s.fraudTitle}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink">{s.fraudSub}</p>
      </div>

      <div className="mt-4 space-y-3">
        {blocks.map((b) => (
          <section key={b.t} className="card p-5">
            <h2 className="font-display font-bold text-[16px]">{b.t}</h2>
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

      <button onClick={onContinue}
        className="tap mt-6 w-full rounded-xl border border-acid/50 px-5 py-3.5 text-[16px] font-semibold text-acid">
        {s.continueBtn}
      </button>
    </div>
  );
}
