"use client";

import { useCallback, useEffect, useState } from "react";
import Drafts from "./Drafts";
import Evidence from "./Evidence";

type Dict = Record<string, string>;
type CaseRow = {
  id: string; platform: string; fake_handle: string; real_handle: string | null;
  display_name: string; severity: string; status: string; report_count: number;
  verification_code: string; verified_at: string | null; created_at: string; delete_after: string;
};

export default function ManageDash({ id, s, siteUrl }: { id: string; s: Dict; siteUrl: string }) {
  const [key, setKey] = useState<string | null>(null);
  const [row, setRow] = useState<CaseRow | null>(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState("");
  const [offerReview, setOfferReview] = useState(false);
  const [reviewSent, setReviewSent] = useState(false);
  const [copied, setCopied] = useState("");
  const [events, setEvents] = useState<string[]>([]);
  const [artifactCount, setArtifactCount] = useState(0);

  // The manage key lives in the URL fragment, so it is available to this script
  // and to nothing else — not the server, not the access log, not a Referer.
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const k = hash.get("key");
    if (!k) { setError("This link is missing its access key. Use the exact link you were given."); return; }
    setKey(k);
  }, []);

  const load = useCallback(async (k: string) => {
    const res = await fetch(`/api/shield/cases/${id}/manage`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: k }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? "Could not load your case."); return; }
    setRow(json.case);
    setEvents((json.events ?? []).map((e: { type: string }) => e.type));
    setArtifactCount(json.artifactCount ?? 0);
  }, [id]);

  useEffect(() => { if (key) void load(key); }, [key, load]);

  async function verify() {
    if (!key) return;
    setChecking(true); setVerifyMsg("");
    const res = await fetch(`/api/shield/cases/${id}/verify`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key }),
    });
    const json = await res.json();
    setChecking(false);
    if (json.ok) { setVerifyMsg(""); void load(key); return; }
    // "we could not check" is reported differently from "we checked and it
    // wasn't there" — a victim who did everything right must not be told they failed.
    // "indeterminate" means the platform withheld the profile text, so we never
    // actually looked. Saying "we couldn't find your code" there accuses a real
    // victim of not doing something they did.
    if (json.reason === "indeterminate" || json.reason === "blocked") {
      setVerifyMsg(s.indeterminate);
      setOfferReview(true);
    } else if (json.reason === "not_found") {
      setVerifyMsg(s.failed.replace("{handle}", `@${row?.real_handle ?? ""}`));
      setOfferReview(true);
    } else {
      setVerifyMsg("We couldn't reach the platform to check just now. Wait a minute and try again.");
    }
  }

  const copy = async (text: string, tag: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(tag); setTimeout(() => setCopied(""), 2000); } catch {}
  };

  if (error) return <p className="rounded-xl border border-[#ff6b6b]/40 bg-[#ff6b6b]/5 px-5 py-4 text-[15px]">{error}</p>;
  if (!row) return <p className="font-mono text-sm text-dim">{s.loading}</p>;

  const caseUrl = `${siteUrl}/c/${row.id}`;
  const live = row.status === "live";

  // Two of these Shield can observe for itself; the rest are self-reported,
  // because filing a form on someone else's platform is invisible to us.
  const checklist: Array<{ label: string; done: boolean; note?: string; step?: string }> = [
    { label: s.c_verified, done: Boolean(row.verified_at) },
    { label: s.c_friends, done: row.report_count > 0, note: row.report_count > 0 ? String(row.report_count) : undefined },
    { label: s.c_meta, done: events.includes("meta_form_filed"), step: "meta_form_filed" },
    { label: s.c_complaint, done: events.includes("complaint_filed"), step: "complaint_filed" },
    { label: s.c_grievance, done: events.includes("grievance_sent"), step: "grievance_sent" },
  ];

  async function toggleStep(step: string, done: boolean) {
    if (!key) return;
    setEvents((prev) => (done ? prev.filter((e) => e !== step) : [...prev, step]));
    const res = await fetch(`/api/shield/cases/${id}/step`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, step, undo: done }),
    });
    if (res.ok) {
      const j = await res.json();
      setEvents((j.events ?? []).map((e: { type: string }) => e.type));
    }
  }

  return (
    <div>
      <h1 className="font-display font-bold text-2xl">{s.title}</h1>
      <p className="mt-1 font-mono text-[11px] text-dim">#{row.id}</p>

      {!live && (
        <section className="mt-6 rounded-xl border border-warn/40 bg-[#f5c451]/[0.06] p-5">
          <h2 className="font-display font-bold text-[17px]">{s.vTitle}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-dim">{s.vSub}</p>

          {/* Human review leads. The automated route is offered second and
              honestly described, because Instagram returns an empty body to
              server-side requests — so telling a frightened person to edit their
              bio and then reporting that we "couldn't find" the code accuses
              them of failing at something that was never possible. */}
          {!reviewSent ? (
            <div className="mt-5 rounded-xl border border-acid/35 bg-acid/[0.05] p-4">
              <p className="text-[14px] leading-relaxed text-dim">
                {s.reviewPrimaryD.replace("{handle}", `@${row.real_handle ?? ""}`)}
              </p>
              <button
                onClick={async () => {
                  if (!key) return;
                  await fetch(`/api/shield/cases/${id}/review`, {
                    method: "POST", headers: { "content-type": "application/json" },
                    body: JSON.stringify({ key }),
                  });
                  setReviewSent(true);
                }}
                className="tap mt-3 w-full rounded-xl bg-acid px-6 py-3.5 font-semibold text-void"
              >
                {s.reviewPrimary}
              </button>
            </div>
          ) : (
            <p className="mt-5 rounded-xl border border-acid/30 bg-acid/[0.05] px-4 py-3 text-[14px] leading-relaxed text-ink">
              {s.reviewSent.replace("{handle}", `@${row.real_handle ?? ""}`)}
            </p>
          )}

          <details className="mt-5 border-t border-line pt-4">
            <summary className="cursor-pointer font-mono text-[12px] uppercase tracking-wider text-dim">
              {s.autoTitle}
            </summary>
            <p className="mt-3 text-[14px] leading-relaxed text-dim">
              {s.autoD.replace("{handle}", `@${row.real_handle ?? ""}`)}
            </p>
            <button onClick={() => copy(row.verification_code, "code")}
              className="tap mt-3 w-full rounded-xl border border-line bg-panel/60 px-4 py-3 font-mono text-[17px] text-acid">
              {copied === "code" ? s.copied : row.verification_code}
            </button>
            <button onClick={verify} disabled={checking}
              className="tap mt-3 w-full rounded-xl border border-acid/50 px-6 py-3 font-semibold text-acid disabled:opacity-50">
              {checking ? s.checking.replace("{handle}", `@${row.real_handle ?? ""}`) : s.check}
            </button>
            {verifyMsg && <p className="mt-3 text-[14px] leading-relaxed text-warn">{verifyMsg}</p>}
          </details>
        </section>
      )}

      {live && (
        <section className="mt-6 rounded-xl border border-acid/30 bg-acid/[0.05] p-5">
          <h2 className="font-display font-bold text-[17px]">{s.shareTitle}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-dim">{s.shareD}</p>
          <button onClick={() => copy(caseUrl, "link")}
            className="tap mt-3 w-full rounded-xl border border-line bg-panel/60 px-4 py-3 font-mono text-[13px] text-ink break-all">
            {copied === "link" ? s.copied : caseUrl}
          </button>
          <a href={`https://wa.me/?text=${encodeURIComponent(caseUrl)}`} target="_blank" rel="noopener noreferrer"
            className="tap mt-2 w-full rounded-xl bg-acid px-6 py-3.5 font-semibold text-void">
            {s.whatsapp}
          </a>
        </section>
      )}

      <section className="mt-6">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-dim">{s.checklist}</h2>
        <ul className="mt-3 space-y-2">
          {checklist.map((c) => (
            <li key={c.label} className="flex items-center gap-3 rounded-lg border border-line px-4 py-3">
              <button
                type="button"
                disabled={!c.step}
                onClick={() => c.step && toggleStep(c.step, c.done)}
                aria-pressed={c.done}
                aria-label={c.label}
                className={`inline-block h-5 w-5 shrink-0 rounded-[3px] border ${
                  c.done ? "border-acid bg-acid" : "border-line"} ${c.step ? "cursor-pointer" : "cursor-default"}`}
              />
              <span className={`text-[15px] ${c.done ? "text-ink" : "text-dim"}`}>{c.label}</span>
              {c.note && <span className="ml-auto font-mono text-[13px] text-acid">{c.note}</span>}
            </li>
          ))}
        </ul>
      </section>

      {key && (
        <Evidence
          id={id} mkey={key} s={s}
          initialCount={artifactCount}
          live={live}
        />
      )}

      {key && <Drafts id={id} mkey={key} labels={s} />}

      <p className="mt-8 rounded-lg border border-line px-4 py-3 text-[13px] leading-relaxed text-dim">
        {s.keepSecret}
      </p>
    </div>
  );
}
