"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NCIIRoute from "./NCIIRoute";
import FraudRoute from "./FraudRoute";

type Dict = Record<string, string>;

const SEVERITIES = ["existing", "posting_photos", "messaging_contacts", "asking_money", "intimate"] as const;
const PLATFORMS = ["instagram", "whatsapp", "facebook", "snapchat"] as const;

export default function Wizard({ s, locale }: { s: Dict; locale: "en" | "hi" }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [platform, setPlatform] = useState<string>("instagram");
  const [fakeHandle, setFakeHandle] = useState("");
  const [realHandle, setRealHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [severity, setSeverity] = useState<string>("");
  const [contactValue, setContactValue] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [route, setRoute] = useState<"none" | "ncii" | "fraud">("none");

  const canNext =
    (step === 1 && fakeHandle.trim().length > 0) ||
    (step === 2 && displayName.trim().length > 0) ||
    (step === 3 && severity !== "") ||
    step === 4;

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/shield/cases", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          platform, fakeHandle, realHandle, displayName, severity, contactValue,
          contactChannel: contactValue.includes("@") ? "email" : "whatsapp",
          locale, consent,
        }),
      });
      // A non-JSON body means we did not reach the API at all — a wrong path, a
      // proxy error page, a 502. Reporting that as "network problem" sends the
      // user off to check their wifi while the actual fault is server-side and
      // invisible. Say which it was.
      let json: { id?: string; manageKey?: string; error?: string } | null = null;
      try { json = await res.json(); } catch { json = null; }

      if (!res.ok || !json) {
        setError(json?.error ?? `The server returned an unexpected response (HTTP ${res.status}). Please try again — if it keeps happening, the tool is broken, not you.`);
        setBusy(false);
        return;
      }
      // The manage key exists only in this response. It goes in the URL fragment
      // rather than the query string so it is never sent to the server, never
      // lands in an access log, and never leaks through a Referer header.
      const dest = `/shield/c/${json.id}/manage#key=${json.manageKey}`;
      router.push(severity === "asking_money" ? `${dest}&fraud=1` : dest);
    } catch {
      setError("Network problem. Please check your connection and try again.");
      setBusy(false);
    }
  }

  const field =
    "w-full rounded-xl border border-line bg-panel/60 px-4 py-3.5 text-[16px] text-ink outline-none placeholder:text-dim/50 focus:border-acid/60";

  if (route === "ncii") return <NCIIRoute s={s} onBack={() => { setRoute("none"); setSeverity(""); }} />;
  if (route === "fraud") return <FraudRoute s={s} onContinue={() => { setRoute("none"); setStep(4); }} />;

  return (
    <div>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={`h-1 flex-1 rounded ${i <= step ? "bg-acid" : "bg-line"}`} />
        ))}
      </div>
      <p className="mt-3 font-mono text-[11px] text-dim">{s.step.replace("{n}", String(step))}</p>

      {step === 1 && (
        <div className="mt-6">
          <h1 className="font-display font-bold text-2xl leading-snug">{s.q1}</h1>
          <p className="mt-2 text-[15px] text-dim leading-relaxed">{s.q1help}</p>
          <input
            className={`${field} mt-5 font-mono text-[15px]`} value={fakeHandle}
            onChange={(e) => setFakeHandle(e.target.value)} placeholder={s.q1placeholder}
            autoCapitalize="none" autoCorrect="off" spellCheck={false} inputMode="url" autoFocus
          />
          <p className="mt-6 font-mono text-[11px] uppercase tracking-wider text-dim">{s.platform}</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {PLATFORMS.map((p) => (
              <button key={p} type="button" onClick={() => setPlatform(p)}
                className={`tap rounded-xl border px-4 py-3 text-[15px] capitalize transition-colors ${
                  platform === p ? "border-acid/60 bg-acid/10 text-ink" : "border-line text-dim"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6">
          <h1 className="font-display font-bold text-2xl leading-snug">{s.q2}</h1>
          <p className="mt-2 text-[15px] text-dim leading-relaxed">{s.q2help}</p>
          <input
            className={`${field} mt-5 font-mono text-[15px]`} value={realHandle}
            onChange={(e) => setRealHandle(e.target.value)} placeholder={s.q2placeholder}
            autoCapitalize="none" autoCorrect="off" spellCheck={false} autoFocus
          />
          <label className="mt-6 block font-mono text-[11px] uppercase tracking-wider text-dim">
            {s.nameLabel}
          </label>
          <input className={`${field} mt-2`} value={displayName}
            onChange={(e) => setDisplayName(e.target.value)} placeholder={s.namePlaceholder} maxLength={80} />
        </div>
      )}

      {step === 3 && (
        <div className="mt-6">
          <h1 className="font-display font-bold text-2xl leading-snug">{s.q3}</h1>
          <div className="mt-5 space-y-2">
            {SEVERITIES.map((sev) => (
              <button key={sev} type="button" onClick={() => setSeverity(sev)}
                className={`w-full rounded-xl border px-4 py-4 text-left transition-colors ${
                  severity === sev ? "border-acid/60 bg-acid/10" : "border-line"}`}>
                <span className="block font-semibold text-[16px] text-ink">{s[`sev_${sev}`]}</span>
                <span className="mt-1 block text-[14px] leading-snug text-dim">{s[`sev_${sev}_d`]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="mt-6">
          <h1 className="font-display font-bold text-2xl leading-snug">
            {s.q4.replace("{optional}", s.optional)}
          </h1>
          <p className="mt-2 text-[15px] text-dim leading-relaxed">{s.q4help}</p>
          <input className={`${field} mt-5`} value={contactValue} onChange={(e) => setContactValue(e.target.value)}
            placeholder="you@example.com / +91…" inputMode="email" autoCapitalize="none" />

          <label className="mt-6 flex gap-3 items-start cursor-pointer">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 accent-[#2de0b3]" />
            <span className="text-[14px] leading-relaxed text-dim">{s.consent}</span>
          </label>
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-xl border border-[#ff6b6b]/40 bg-[#ff6b6b]/5 px-4 py-3">
          <p className="text-[15px] text-ink">{error}</p>
        </div>
      )}

      <div className="mt-8 flex gap-3">
        {step > 1 && (
          <button type="button" onClick={() => setStep(step - 1)}
            className="tap rounded-xl border border-line px-5 text-[15px] text-dim">
            {s.back}
          </button>
        )}
        {step < 4 ? (
          <button type="button" disabled={!canNext}
            onClick={() => {
              if (step === 3 && severity === "intimate") { setRoute("ncii"); return; }
              if (step === 3 && severity === "asking_money") { setRoute("fraud"); return; }
              setStep(step + 1);
            }}
            className="tap flex-1 rounded-xl bg-acid px-6 font-semibold text-void disabled:opacity-40">
            {s.continue}
          </button>
        ) : (
          <button type="button" disabled={!consent || busy} onClick={submit}
            className="tap flex-1 rounded-xl bg-acid px-6 font-semibold text-void disabled:opacity-40">
            {busy ? s.creating : s.submit}
          </button>
        )}
      </div>
    </div>
  );
}
