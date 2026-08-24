"use client";

import { useEffect, useState } from "react";

type Dict = Record<string, string>;

export default function ReportFlow({
  id, s, profileUrl, initialCount, displayName, shareUrl,
}: {
  id: string; s: Dict; profileUrl: string; initialCount: number; displayName: string; shareUrl: string;
}) {
  const [count, setCount] = useState(initialCount);
  const [state, setState] = useState<"idle" | "opened" | "done" | "already">("idle");
  const [copied, setCopied] = useState(false);

  // A device that has already reported gets the confirmed state back on reload,
  // so a friend who returns to the link is not nagged into reporting twice.
  useEffect(() => {
    try {
      if (localStorage.getItem(`shield:reported:${id}`)) setState("done");
    } catch { /* private mode — the server-side dedup still holds */ }
  }, [id]);

  // Poll rather than open a realtime socket. A websocket on a page loaded by a
  // few hundred people on Indian mobile data costs more than it returns, and the
  // counter does not need to be accurate to the second.
  useEffect(() => {
    const tick = async () => {
      try {
        const r = await fetch(`/api/shield/cases/${id}/report`, { cache: "no-store" });
        if (r.ok) setCount((await r.json()).count ?? 0);
      } catch { /* offline — keep the last known number */ }
    };
    const iv = setInterval(tick, 15000);
    const onVis = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(iv); document.removeEventListener("visibilitychange", onVis); };
  }, [id]);

  async function confirm() {
    const res = await fetch(`/api/shield/cases/${id}/report`, { method: "POST" });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setCount(json.count ?? count);
      setState(json.already ? "already" : "done");
      try { localStorage.setItem(`shield:reported:${id}`, "1"); } catch {}
    }
  }

  const counterText =
    count === 0 ? s.counterZero
    : (count === 1 ? s.counter_one : s.counter_other).replace("{n}", String(count));

  const waMsg = encodeURIComponent(
    s.shareMsg.replace("{name}", displayName).replace("{url}", shareUrl),
  );

  return (
    <div className="mt-8">
      <div className="rounded-xl border border-acid/30 bg-acid/[0.06] px-5 py-6 text-center">
        <div className="font-display font-bold text-4xl text-acid tabular-nums">{count}</div>
        <p className="mt-2 text-[15px] text-ink leading-snug">{counterText}</p>
      </div>

      <a
        href={profileUrl} target="_blank" rel="noopener noreferrer"
        onClick={() => setState((v) => (v === "idle" ? "opened" : v))}
        className="tap mt-5 w-full rounded-xl bg-acid px-6 py-4 text-lg font-semibold text-void hover:bg-acid/85 transition-colors"
      >
        {s.cta}
      </a>
      <p className="mt-2 text-center font-mono text-[11px] text-dim">{s.ctaSub}</p>

      <ol className="mt-7 space-y-3">
        {[s.s1, s.s2, s.s3, s.s4.replace("{name}", displayName)].map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="font-mono text-xs text-acid pt-0.5 shrink-0">{i + 1}</span>
            <span className="text-[15px] leading-relaxed text-dim">{step}</span>
          </li>
        ))}
      </ol>

      {state === "done" || state === "already" ? (
        <div className="mt-7 rounded-xl border border-acid/40 bg-acid/5 px-5 py-4 text-center">
          <p className="text-[15px] text-ink">{state === "already" ? s.already : s.doneThanks}</p>
        </div>
      ) : (
        <button onClick={confirm}
          className="tap mt-7 w-full rounded-xl border border-acid/50 px-6 py-3.5 text-[16px] font-semibold text-acid">
          {s.done}
        </button>
      )}

      <div className="mt-10 border-t border-line pt-7">
        <h2 className="font-display font-bold text-[17px]">{s.share}</h2>
        <a href={`https://wa.me/?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
          className="tap mt-3 w-full rounded-xl border border-line px-5 py-3.5 text-[16px] text-ink">
          {s.whatsapp}
        </a>
        <button
          onClick={async () => {
            try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
          }}
          className="tap mt-2 w-full rounded-xl border border-line px-5 py-3.5 text-[16px] text-dim">
          {copied ? s.copied : s.copyLink}
        </button>
      </div>
    </div>
  );
}
