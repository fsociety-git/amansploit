"use client";

import NextStep from "./NextStep";
import PrintButton from "./PrintButton";

/**
 * Result renderers for the tools.
 *
 * These live in a client module rather than being passed down as a render prop
 * from the page: a Server Component cannot hand a function to a Client
 * Component, because functions do not survive serialisation across that
 * boundary. ToolShell picks the renderer by variant instead.
 */

interface Check {
  key: string;
  name: string;
  present: boolean;
  value?: string;
  note: string;
  fix: string;
}

export function HeadersResult({ d }: { d: Record<string, unknown> }) {
  const grade = String(d.grade);
  const checks = (d.checks ?? []) as Check[];
  const warnings = (d.warnings ?? []) as string[];
  const good = grade === "A+" || grade === "A";

  return (
    <div>
      <div className="card-line rounded-xl p-7 flex items-center gap-6">
        <div
          className={`shrink-0 grid place-items-center h-24 w-24 rounded-xl font-display font-bold text-4xl ${
            good ? "bg-acid text-void" : "bg-panel2 text-acid border border-acid/40"
          }`}
        >
          {grade}
        </div>
        <div className="min-w-0">
          <div className="font-mono text-xs text-dim break-all">{String(d.target)}</div>
          <div className="mt-1 text-ink">
            {checks.filter((c) => c.present).length} of {checks.length} headers present
            <span className="text-dim"> · score {String(d.score)}/100</span>
          </div>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="mt-5 card-line rounded-xl p-5">
          <div className="kicker mb-2">Worth a closer look</div>
          <ul className="space-y-1.5">
            {warnings.map((w) => (
              <li key={w} className="text-sm text-dim leading-relaxed">— {w}</li>
            ))}
          </ul>
        </div>
      )}

      <PrintButton />

      <div className="mt-5 space-y-3">
        {checks.map((c) => (
          <div key={c.key} className="card-line rounded-xl p-5">
            <div className="flex items-start gap-3">
              <span className={c.present ? "text-acid" : "text-red-400"}>
                {c.present ? "✓" : "✕"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-ink">{c.name}</div>
                <p className="mt-1 text-sm text-dim leading-relaxed">{c.note}</p>
                {c.present && c.value && (
                  <pre className="mt-2 overflow-x-auto rounded bg-void/70 p-2.5 font-mono text-[11px] text-dim">
                    {c.value}
                  </pre>
                )}
                {!c.present && (
                  <p className="mt-2 font-mono text-[11px] text-acid">set → {c.fix}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <NextStep
        severity={
          d.blocked
            ? "unknown"
            : good
              ? "good"
              : grade === "B" || grade === "C"
                ? "middling"
                : "bad"
        }
        offerSlug="security-headers"
        problem={`${checks.filter((c) => !c.present).length} of ${checks.length} headers are missing on ${String(d.target)}, which is a grade ${grade}. Each one is a single line of server configuration.`}
      />
    </div>
  );
}

export function EmailResult({ d }: { d: Record<string, unknown> }) {
  const verdict = String(d.verdict);
  const spf = d.spf as { record: string | null; verdict: string };
  const dmarc = d.dmarc as { record: string | null; policy: string | null };
  const dkim = d.dkim as { selectorsFound: string[] };
  const notes = (d.notes ?? []) as string[];
  const domain = String(d.domain);

  const tone =
    verdict === "spoofable"
      ? "border-red-500/50"
      : verdict === "partial"
      ? "border-yellow-500/40"
      : "border-acid/50";
  const toneText =
    verdict === "spoofable"
      ? "text-red-400"
      : verdict === "partial"
      ? "text-yellow-400"
      : "text-acid";
  const label =
    verdict === "spoofable" ? "SPOOFABLE" : verdict === "partial" ? "PARTIAL" : "PROTECTED";

  return (
    <div>
      <div className={`card-line rounded-xl p-7 ${tone}`}>
        <div className={`font-mono text-xs tracking-[0.2em] ${toneText}`}>{label}</div>
        <p className="mt-3 text-lg text-ink leading-relaxed">{String(d.headline)}</p>
        <div className="mt-2 font-mono text-xs text-dim">{domain}</div>
      </div>

      <PrintButton />

      <div className="mt-5 grid sm:grid-cols-3 gap-3">
        {[
          {
            n: "SPF",
            ok: spf.verdict === "strong" || spf.verdict === "soft",
            sub: spf.record ? spf.verdict : "missing",
          },
          { n: "DMARC", ok: dmarc.policy === "reject", sub: dmarc.policy ?? "missing" },
          {
            n: "DKIM",
            ok: dkim.selectorsFound.length > 0,
            sub: dkim.selectorsFound.length ? dkim.selectorsFound.join(", ") : "not found",
          },
        ].map((x) => (
          <div key={x.n} className="card-line rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{x.n}</span>
              <span className={x.ok ? "text-acid" : "text-red-400"}>{x.ok ? "✓" : "✕"}</span>
            </div>
            <div className="mt-1 font-mono text-[11px] text-dim break-all">{x.sub}</div>
          </div>
        ))}
      </div>

      {notes.length > 0 && (
        <div className="mt-5 card-line rounded-xl p-5">
          <div className="kicker mb-2">What this means</div>
          <ul className="space-y-2">
            {notes.map((n) => (
              <li key={n} className="text-sm text-dim leading-relaxed">— {n}</li>
            ))}
          </ul>
        </div>
      )}

      {(spf.record || dmarc.record) && (
        <div className="mt-5 card-line rounded-xl p-5">
          <div className="kicker mb-3">Records found</div>
          {spf.record && (
            <pre className="overflow-x-auto rounded bg-void/70 p-2.5 font-mono text-[11px] text-dim">
              {spf.record}
            </pre>
          )}
          {dmarc.record && (
            <pre className="mt-2 overflow-x-auto rounded bg-void/70 p-2.5 font-mono text-[11px] text-dim">
              {dmarc.record}
            </pre>
          )}
        </div>
      )}

      {(verdict === "spoofable" || verdict === "partial") && (
        <div className="mt-5 card-line rounded-xl p-5">
          <div className="kicker mb-2">The fix</div>
          <p className="text-sm text-dim leading-relaxed">
            Publish a DMARC record and move it to enforcement in stages — start at p=none
            with reporting on, read the reports until every legitimate sender is passing,
            then move to quarantine and finally reject.
          </p>
          <pre className="mt-3 overflow-x-auto rounded bg-void/70 p-2.5 font-mono text-[11px] text-acid">
            {`_dmarc.${domain}  TXT  "v=DMARC1; p=none; rua=mailto:dmarc@${domain}; pct=100"`}
          </pre>
        </div>
      )}

      <NextStep
        severity={
          d.inconclusive
            ? "unknown"
            : verdict === "spoofable"
              ? "bad"
              : verdict === "partial"
                ? "middling"
                : "good"
        }
        offerSlug="email-spoofing"
        problem={
          verdict === "spoofable"
            ? `Right now, anyone on the internet can send email that appears to come from ${domain}. Receiving servers have been given no instruction to refuse it.`
            : `${domain} has partial protection — detection is in place but enforcement isn't, so forged mail can still be delivered.`
        }
      />
    </div>
  );
}
