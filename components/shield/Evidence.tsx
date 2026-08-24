"use client";

import { useRef, useState } from "react";

export default function Evidence({
  id, mkey, s, initialCount, live,
}: { id: string; mkey: string; s: Record<string, string>; initialCount: number; live: boolean }) {
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState<"" | "capture" | "upload">("");
  const [note, setNote] = useState<{ kind: "ok" | "warn"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function capture() {
    setBusy("capture"); setNote(null);
    const res = await fetch(`/api/shield/cases/${id}/evidence`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: mkey }),
    });
    const j = await res.json().catch(() => ({}));
    setBusy("");
    if (j.ok) { setCount((n) => n + 2); setNote({ kind: "ok", text: s.captureOk }); }
    else setNote({ kind: "warn", text: s.captureBlocked });
  }

  async function upload(file: File) {
    setBusy("upload"); setNote(null);
    const fd = new FormData();
    fd.set("key", mkey); fd.set("file", file);
    const res = await fetch(`/api/shield/cases/${id}/evidence`, { method: "PUT", body: fd });
    const j = await res.json().catch(() => ({}));
    setBusy("");
    if (res.ok) { setCount((n) => n + 1); setNote({ kind: "ok", text: s.captureOk }); }
    else setNote({ kind: "warn", text: j.error ?? "Upload failed." });
  }

  async function downloadPack() {
    const res = await fetch(`/api/shield/cases/${id}/pack`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: mkey }),
    });
    if (!res.ok) return;
    // Blob + object URL, so the manage key never appears in a navigable URL.
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `shield-evidence-${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const plural = (count === 1 ? s.artifacts_one : s.artifacts_other).replace("{n}", String(count));

  return (
    <section className="mt-8">
      <h2 className="font-mono text-[11px] uppercase tracking-wider text-dim">{s.evidence}</h2>

      <div className="mt-3 card p-5">
        <p className="font-mono text-[13px] text-acid">{plural}</p>

        <button onClick={capture} disabled={busy !== ""}
          className="tap mt-4 w-full rounded-xl border border-line px-5 py-3 text-[15px] text-ink disabled:opacity-50">
          {busy === "capture" ? s.capturing : s.capture}
        </button>

        <p className="mt-4 text-[14px] leading-relaxed text-dim">{s.uploadHint}</p>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = ""; }} />
        <button onClick={() => fileRef.current?.click()} disabled={busy !== ""}
          className="tap mt-3 w-full rounded-xl border border-acid/50 px-5 py-3 text-[15px] font-semibold text-acid disabled:opacity-50">
          {busy === "upload" ? s.uploading : s.upload}
        </button>

        {note && (
          <p className={`mt-4 text-[14px] leading-relaxed ${note.kind === "ok" ? "text-acid" : "text-warn"}`}>
            {note.text}
          </p>
        )}

        <button onClick={downloadPack} disabled={count === 0}
          className="tap mt-5 w-full rounded-xl bg-acid px-5 py-3.5 font-semibold text-void disabled:opacity-40">
          {s.download}
        </button>
      </div>

      {live && (
        <div className="mt-3 card p-5">
          <p className="text-[14px] leading-relaxed text-dim">{s.storyHint}</p>
          <a href={`/api/shield/cases/${id}/story`} target="_blank" rel="noopener noreferrer"
            className="tap mt-3 w-full rounded-xl border border-line px-5 py-3 text-[15px] text-ink">
            {s.story}
          </a>
        </div>
      )}
    </section>
  );
}
