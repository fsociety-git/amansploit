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

interface SurfaceRow {
  host: string;
  state: "live" | "dead" | "unknown";
  addr?: string;
  note?: string;
}

export function SurfaceResult({ d }: { d: Record<string, unknown> }) {
  const rows = (d.results ?? []) as SurfaceRow[];
  const domain = String(d.domain);
  const notable = rows.filter((r) => r.state === "live" && r.note);
  const live = rows.filter((r) => r.state === "live" && !r.note);
  const rest = rows.filter((r) => r.state !== "live");

  if (d.inconclusive) {
    return (
      <div>
        <div className="card-line rounded-xl p-7">
          <div className="font-mono text-xs tracking-[0.2em] text-yellow-400">INCONCLUSIVE</div>
          <p className="mt-3 text-lg text-ink leading-relaxed">{String(d.headline)}</p>
        </div>
        <NextStep severity="unknown" offerSlug="attack-surface" />
      </div>
    );
  }

  return (
    <div>
      <div className={`card-line rounded-xl p-7 ${notable.length ? "border-yellow-500/40" : ""}`}>
        <div className="font-mono text-xs tracking-[0.2em] text-dim">EXPOSED SURFACE</div>
        <p className="mt-3 text-lg text-ink leading-relaxed">{String(d.headline)}</p>
        <div className="mt-2 font-mono text-xs text-dim">{domain}</div>
      </div>

      <PrintButton />

      <div className="mt-5 grid sm:grid-cols-3 gap-3">
        {[
          { n: "In the logs", v: String(d.totalNames), s: "hostnames ever certified" },
          { n: "Still resolving", v: String(d.liveCount), s: `of ${String(d.checkedCount)} checked` },
          { n: "Worth a look", v: String(d.notableCount), s: "by name alone" },
        ].map((x) => (
          <div key={x.n} className="card-line rounded-xl p-4">
            <div className="font-mono text-[11px] text-dim uppercase tracking-wider">{x.n}</div>
            <div className="mt-1 font-display font-bold text-2xl text-acid">{x.v}</div>
            <div className="font-mono text-[11px] text-dim">{x.s}</div>
          </div>
        ))}
      </div>

      {notable.length > 0 && (
        <div className="mt-5 card-line rounded-xl p-5 border-yellow-500/30">
          <div className="kicker mb-3 text-yellow-400">Worth a closer look</div>
          <div className="space-y-3">
            {notable.map((r) => (
              <div key={r.host}>
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-mono text-[13px] text-ink break-all">{r.host}</span>
                  {r.addr && <span className="font-mono text-[11px] text-dim">{r.addr}</span>}
                </div>
                <p className="mt-0.5 text-[13px] text-dim leading-relaxed">{r.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {live.length > 0 && (
        <div className="mt-5 card-line rounded-xl p-5">
          <div className="kicker mb-3">Also resolving</div>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
            {live.map((r) => (
              <div key={r.host} className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-[12px] text-dim break-all">{r.host}</span>
                <span className="font-mono text-[11px] text-dim/60 shrink-0">{r.addr}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div className="mt-5 card-line rounded-xl p-5">
          <div className="kicker mb-2">Certified but not resolving</div>
          <p className="text-sm text-dim leading-relaxed">
            {rest.filter((r) => r.state === "dead").length} names appear in the logs but have no
            DNS record today — usually decommissioned, sometimes just moved internal.
            {rest.some((r) => r.state === "unknown") &&
              ` ${rest.filter((r) => r.state === "unknown").length} could not be resolved either way and are not counted as gone.`}
          </p>
        </div>
      )}

      {Boolean(d.truncated) && (
        <p className="mt-4 text-[13px] text-dim leading-relaxed">
          Only the first {String(d.checkedCount)} of {String(d.totalNames)} names were resolved,
          to keep the check quick. The rest are in the public logs and a full review would cover
          all of them.
        </p>
      )}

      <NextStep
        severity={notable.length ? "middling" : "good"}
        offerSlug="attack-surface"
        problem={
          notable.length
            ? `${notable.length} hostnames under ${domain} carry names that suggest admin panels, non-production environments or internal tooling — and they resolve from the public internet. This check reads names only; it does not look at what they actually serve.`
            : undefined
        }
      />
    </div>
  );
}

/* ── TLS ──────────────────────────────────────────────────────────────── */

interface VersionRow { version: string; offered: boolean; cipher?: string; untestable?: boolean }

export function TlsResult({ d }: { d: Record<string, unknown> }) {
  const host = String(d.host);
  if (d.inconclusive) {
    return (
      <div>
        <div className="card-line rounded-xl p-7 border-yellow-500/40">
          <div className="font-mono text-xs tracking-[0.2em] text-yellow-400">INCONCLUSIVE</div>
          <p className="mt-3 text-lg text-ink leading-relaxed">{String(d.headline)}</p>
        </div>
        <NextStep severity="unknown" offerSlug="security-headers" />
      </div>
    );
  }

  const grade = String(d.grade);
  const good = grade === "A";
  const versions = (d.versions ?? []) as VersionRow[];
  const issues = (d.issues ?? []) as string[];
  const cert = d.certificate as {
    subject: string | null; issuer: string | null; validTo: string | null;
    daysLeft: number | null; altNames: string[]; trusted: boolean;
  } | null;
  const neg = d.negotiated as { protocol?: string; cipher?: string };

  return (
    <div>
      <div className="card-line rounded-xl p-7 flex items-center gap-6">
        <div className={`shrink-0 grid place-items-center h-24 w-24 rounded-xl font-display font-bold text-4xl ${good ? "bg-acid text-void" : "bg-panel2 text-acid border border-acid/40"}`}>
          {grade}
        </div>
        <div className="min-w-0">
          <div className="font-mono text-xs text-dim break-all">{host}</div>
          <div className="mt-1 text-ink">{neg?.protocol}<span className="text-dim"> · {neg?.cipher}</span></div>
        </div>
      </div>

      <PrintButton />

      <p className="mt-5 text-[15px] text-ink leading-relaxed">{String(d.headline)}</p>

      <div className="mt-5 card-line rounded-xl p-5">
        <div className="kicker mb-3">Protocol versions offered</div>
        <div className="space-y-2">
          {versions.map((v) => (
            <div key={v.version} className="flex items-center justify-between gap-3">
              <span className="font-mono text-[13px] text-ink">{v.version}</span>
              <span className="flex items-center gap-3">
                {v.cipher && <span className="font-mono text-[11px] text-dim">{v.cipher}</span>}
                <span className={`font-mono text-[11px] ${v.offered ? (v.version === "TLSv1" || v.version === "TLSv1.1" ? "text-red-400" : "text-acid") : v.untestable ? "text-yellow-400" : "text-dim"}`}>
                  {v.offered ? "offered" : v.untestable ? "not testable" : "not offered"}
                </span>
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-dim/80 leading-relaxed">
          &ldquo;Not testable&rdquo; means this checker&apos;s own TLS library refuses to speak that
          version, so the server&apos;s answer is unknown — not that it declined.
        </p>
      </div>

      {issues.length > 0 && (
        <div className="mt-5 card-line rounded-xl p-5 border-yellow-500/30">
          <div className="kicker mb-2 text-yellow-400">Worth changing</div>
          <ul className="space-y-2">
            {issues.map((i) => <li key={i} className="text-sm text-dim leading-relaxed">— {i}</li>)}
          </ul>
        </div>
      )}

      {cert && (
        <div className="mt-5 card-line rounded-xl p-5">
          <div className="kicker mb-3">Certificate</div>
          <div className="space-y-1.5 font-mono text-[12px]">
            <div className="flex justify-between gap-3"><span className="text-dim">subject</span><span className="text-ink break-all">{cert.subject ?? "—"}</span></div>
            <div className="flex justify-between gap-3"><span className="text-dim">issuer</span><span className="text-ink break-all">{cert.issuer ?? "—"}</span></div>
            <div className="flex justify-between gap-3"><span className="text-dim">expires</span><span className={cert.daysLeft !== null && cert.daysLeft < 21 ? "text-yellow-400" : "text-ink"}>{cert.validTo} {cert.daysLeft !== null && `(${cert.daysLeft}d)`}</span></div>
            <div className="flex justify-between gap-3"><span className="text-dim">chain</span><span className={cert.trusted ? "text-acid" : "text-red-400"}>{cert.trusted ? "validates" : "does not validate"}</span></div>
          </div>
          {cert.altNames.length > 1 && (
            <p className="mt-3 text-[12px] text-dim leading-relaxed break-all">
              Also covers: {cert.altNames.slice(0, 12).join(", ")}
              {cert.altNames.length > 12 && ` and ${cert.altNames.length - 12} more`}
            </p>
          )}
        </div>
      )}

      <NextStep
        severity={grade === "F" || grade === "C" ? "bad" : grade === "B" ? "middling" : "good"}
        offerSlug="security-headers"
        problem={issues[0]}
      />
    </div>
  );
}

/* ── DNS hygiene ──────────────────────────────────────────────────────── */

interface DnsCheck { key: string; name: string; state: "pass" | "warn" | "fail" | "unknown"; detail: string; fix?: string }

const DNS_MARK = {
  pass: { g: "▸", c: "text-acid" },
  warn: { g: "!", c: "text-yellow-400" },
  fail: { g: "\u00d7", c: "text-red-400" },
  unknown: { g: "?", c: "text-dim" },
};

export function DnsResult({ d }: { d: Record<string, unknown> }) {
  const checks = (d.checks ?? []) as DnsCheck[];
  const fails = Number(d.failCount ?? 0);
  const warns = Number(d.warnCount ?? 0);

  return (
    <div>
      <div className={`card-line rounded-xl p-7 ${fails ? "border-red-500/40" : warns ? "border-yellow-500/35" : "border-acid/40"}`}>
        <div className={`font-mono text-xs tracking-[0.2em] ${fails ? "text-red-400" : warns ? "text-yellow-400" : "text-acid"}`}>
          {String(d.grade).toUpperCase()}
        </div>
        <p className="mt-3 text-lg text-ink leading-relaxed">{String(d.headline)}</p>
        <div className="mt-2 font-mono text-xs text-dim">{String(d.domain)}</div>
      </div>

      <PrintButton />

      <div className="mt-5 space-y-3">
        {checks.map((c) => {
          const m = DNS_MARK[c.state];
          return (
            <div key={c.key} className="card-line rounded-xl p-5">
              <div className="flex items-start gap-3">
                <span className={m.c}>{m.g}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-ink">{c.name}</div>
                  <p className="mt-1 text-sm text-dim leading-relaxed">{c.detail}</p>
                  {c.fix && <pre className="mt-2 overflow-x-auto rounded bg-void/70 p-2.5 font-mono text-[11px] text-acid">{c.fix}</pre>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <NextStep
        severity={fails ? "bad" : warns > 1 ? "middling" : "good"}
        offerSlug="attack-surface"
        problem={fails ? `${fails} DNS issue${fails > 1 ? "s" : ""} on ${String(d.domain)} that an attacker would look for before anything else.` : undefined}
      />
    </div>
  );
}
