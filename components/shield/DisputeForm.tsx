"use client";

import { useState } from "react";

export default function DisputeForm({ id, s }: { id: string; s: Record<string, string> }) {
  const [reason, setReason] = useState("");
  const [contact, setContact] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [suspended, setSuspended] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setState("busy"); setError("");
    const res = await fetch(`/api/shield/cases/${id}/dispute`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ reason, contact }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) { setError(json.error ?? "Could not submit."); setState("idle"); return; }
    setSuspended(Boolean(json.suspended));
    setState("done");
  }

  if (state === "done") {
    return (
      <div className="rounded-xl border border-acid/40 bg-acid/5 px-5 py-6">
        <h2 className="font-display font-bold text-[17px]">{s.done}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-dim">{s.doneD}</p>
        {suspended && <p className="mt-3 text-[15px] leading-relaxed text-acid">{s.suspended}</p>}
      </div>
    );
  }

  return (
    <div>
      <label className="block font-mono text-[11px] uppercase tracking-wider text-dim">{s.reason}</label>
      <p className="mt-1 text-[14px] leading-relaxed text-dim">{s.reasonHelp}</p>
      <textarea
        value={reason} onChange={(e) => setReason(e.target.value)} rows={6} maxLength={2000}
        className="mt-3 w-full rounded-xl border border-line bg-panel/60 px-4 py-3 text-[16px] text-ink outline-none focus:border-acid/60"
      />
      <label className="mt-5 block font-mono text-[11px] uppercase tracking-wider text-dim">{s.contact}</label>
      <input
        value={contact} onChange={(e) => setContact(e.target.value)}
        className="mt-2 w-full rounded-xl border border-line bg-panel/60 px-4 py-3 text-[16px] text-ink outline-none focus:border-acid/60"
      />
      {error && <p className="mt-4 text-[15px] text-[#ff8a8a]">{error}</p>}
      <button
        onClick={submit} disabled={reason.trim().length < 10 || state === "busy"}
        className="tap mt-6 w-full rounded-xl bg-acid px-6 py-3.5 font-semibold text-void disabled:opacity-40"
      >
        {state === "busy" ? s.sending : s.submit}
      </button>
    </div>
  );
}
