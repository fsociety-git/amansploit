"use client";

import { useCallback, useEffect, useState } from "react";

type Row = {
  id: string; platform: string; fake_handle: string; real_handle: string | null;
  display_name: string; severity: string; status: string; created_at: string;
  dispute_count: number; report_count: number;
};

export default function AdminPanel() {
  const [key, setKey] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(async (k: string) => {
    setErr("");
    const res = await fetch("/api/shield/admin", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ key: k, action: "list" }),
    });
    if (!res.ok) { setErr("Not authorised."); setRows(null); return; }
    const j = await res.json();
    setRows(j.cases ?? []);
    try { sessionStorage.setItem("shield:admin", k); } catch {}
  }, []);

  // sessionStorage, not localStorage: the operator secret should not outlive
  // the tab it was typed into.
  useEffect(() => {
    try {
      const k = sessionStorage.getItem("shield:admin");
      if (k) { setKey(k); void load(k); }
    } catch {}
  }, [load]);

  async function act(id: string, action: "approve" | "reject") {
    setBusy(id);
    await fetch("/api/shield/admin", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, action, id }),
    });
    setBusy("");
    void load(key);
  }

  if (rows === null) {
    return (
      <div>
        <label className="block font-mono text-[11px] uppercase tracking-wider text-dim">Operator key</label>
        <input type="password" value={key} onChange={(e) => setKey(e.target.value)}
          className="mt-2 w-full rounded-xl border border-line bg-panel/60 px-4 py-3 font-mono text-[15px] text-ink outline-none focus:border-acid/60" />
        {err && <p className="mt-3 text-[14px] text-[#ff8a8a]">{err}</p>}
        <button onClick={() => load(key)}
          className="tap mt-4 w-full rounded-xl bg-acid px-6 py-3.5 font-semibold text-void">
          Open queue
        </button>
      </div>
    );
  }

  if (!rows.length)
    return <p className="text-[15px] text-dim">Nothing awaiting review.</p>;

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.id} className="card p-5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-[12px] text-dim">#{r.id}</span>
            <span className={`font-mono text-[10px] uppercase tracking-wider ${
              r.status === "disputed" ? "text-[#ff8a8a]" : "text-warn"}`}>{r.status}</span>
          </div>
          <p className="mt-2 text-[15px] text-ink">
            <span className="text-dim">claims</span> @{r.real_handle ?? "—"}{" "}
            <span className="text-dim">is impersonated by</span> @{r.fake_handle}
          </p>
          <p className="mt-1 text-[13px] text-dim">
            {r.display_name} · {r.severity.replace(/_/g, " ")} · {new Date(r.created_at).toLocaleString("en-IN")}
            {r.dispute_count > 0 && ` · ${r.dispute_count} disputes`}
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-dim">
            Check @{r.real_handle} yourself before approving. Approving publishes a page that asks
            strangers to mass-report @{r.fake_handle}.
          </p>
          <div className="mt-4 flex gap-2">
            <button disabled={busy === r.id} onClick={() => act(r.id, "approve")}
              className="tap flex-1 rounded-xl bg-acid px-4 font-semibold text-void disabled:opacity-40">
              Approve
            </button>
            <button disabled={busy === r.id} onClick={() => act(r.id, "reject")}
              className="tap flex-1 rounded-xl border border-[#ff6b6b]/50 px-4 font-semibold text-[#ff8a8a] disabled:opacity-40">
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
