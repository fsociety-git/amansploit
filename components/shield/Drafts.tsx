"use client";

import { useEffect, useState } from "react";

type Draft = { key: string; title: string; hint: string; body: string; destination?: { label: string; url: string } };
type Rung = { day: number; title: string; body: string; draftKey?: string; due: boolean; ageDays: number };

export default function Drafts({ id, mkey, labels }: { id: string; mkey: string; labels: Record<string, string> }) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [ladder, setLadder] = useState<Rung[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/shield/cases/${id}/drafts`, {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: mkey }),
      });
      if (!res.ok) return;
      const j = await res.json();
      setDrafts(j.drafts ?? []);
      setLadder(j.ladder ?? []);
    })();
  }, [id, mkey]);

  const copy = async (text: string, tag: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(tag); setTimeout(() => setCopied(""), 2000); } catch {}
  };

  if (!drafts.length) return null;

  const byKey = Object.fromEntries(drafts.map((d) => [d.key, d]));
  const age = ladder[0]?.ageDays ?? 0;

  return (
    <>
      <section className="mt-8">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-dim">{labels.ladder}</h2>
        <p className="mt-1 font-mono text-[11px] text-dim/70">
          {labels.dayN.replace("{n}", String(age))}
        </p>
        <ol className="mt-3 space-y-2">
          {ladder.map((r) => (
            <li key={r.day}
              className={`rounded-xl border px-4 py-3.5 ${r.due ? "border-acid/35 bg-acid/[0.04]" : "border-line opacity-55"}`}>
              <div className="flex items-baseline gap-2.5">
                <span className={`font-mono text-[11px] shrink-0 ${r.due ? "text-acid" : "text-dim"}`}>
                  {labels.day} {r.day}
                </span>
                <span className="font-display font-bold text-[15px] leading-snug">{r.title}</span>
              </div>
              <p className="mt-1.5 text-[14px] leading-relaxed text-dim">{r.body}</p>
              {r.draftKey && byKey[r.draftKey] && (
                <button onClick={() => setOpen(r.draftKey!)}
                  className="tap mt-2 font-mono text-[11px] text-acid hover:underline">
                  {labels.openDraft} →
                </button>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-dim">{labels.drafts}</h2>
        <div className="mt-3 space-y-2">
          {drafts.map((d) => (
            <div key={d.key} className="rounded-xl border border-line">
              <button onClick={() => setOpen(open === d.key ? null : d.key)}
                className="tap w-full px-4 py-3.5 text-left">
                <span className="block font-display font-bold text-[15px]">{d.title}</span>
                <span className="mt-1 block text-[13px] leading-snug text-dim">{d.hint}</span>
              </button>

              {open === d.key && (
                <div className="border-t border-line p-4">
                  {/* Rendered as a read-only textarea rather than a <pre>: a long
                      legal draft on a phone needs to scroll inside its own box,
                      and select-all works reliably here where it does not in a
                      block of formatted text. */}
                  <textarea readOnly value={d.body} rows={14}
                    onFocus={(e) => e.currentTarget.select()}
                    className="w-full resize-y rounded-lg border border-line bg-panel/60 p-3 font-mono text-[12px] leading-relaxed text-ink outline-none" />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => copy(d.body, d.key)}
                      className="tap rounded-lg bg-acid px-5 text-[14px] font-semibold text-void">
                      {copied === d.key ? labels.copied : labels.copy}
                    </button>
                    {d.destination && (
                      <a href={d.destination.url} target="_blank" rel="noopener noreferrer"
                        className="tap rounded-lg border border-line px-5 text-[14px] text-dim">
                        {d.destination.label} →
                      </a>
                    )}
                  </div>
                  <p className="mt-3 text-[12px] leading-relaxed text-dim/80">{labels.checkFirst}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
