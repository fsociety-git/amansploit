"use client";

import { useMemo, useState } from "react";

/**
 * Three small utilities that run entirely in the browser.
 *
 * No API route, no network call, nothing leaves the page. That is not an
 * incidental implementation detail — it is the whole reason anyone should use
 * these rather than the first result on Google. People paste live session
 * tokens into JWT decoders. Most of those decoders POST the token to a server
 * before showing you anything, and the ones that don't rarely say so.
 *
 * Every one of these states plainly, on the page, that the work happens
 * locally. That claim is checkable: open the network tab and watch nothing
 * happen.
 */

function Box({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 card-line rounded-xl p-5">
      <div className="kicker mb-3">{label}</div>
      {children}
    </div>
  );
}

const LOCAL_NOTE = (
  <p className="mt-3 font-mono text-[11px] text-acid/80">
    Runs entirely in your browser. Nothing is sent anywhere — check the network tab.
  </p>
);

/* ── JWT decoder ──────────────────────────────────────────────────────── */

const TIME_CLAIMS = new Set(["exp", "iat", "nbf", "auth_time", "updated_at"]);

export function JwtDecoder() {
  const [raw, setRaw] = useState("");

  const out = useMemo(() => {
    const token = raw.trim().replace(/^Bearer\s+/i, "");
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2)
      return { error: "That doesn't look like a JWT — expected at least two dot-separated parts." };

    const dec = (s: string) => {
      try {
        const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
        const pad = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
        return JSON.parse(decodeURIComponent(escape(atob(pad))));
      } catch {
        return null;
      }
    };

    const header = dec(parts[0]);
    const payload = dec(parts[1]);
    if (!header || !payload) return { error: "Could not decode — the base64url segments aren't valid JSON." };

    const now = Math.floor(Date.now() / 1000);
    const notes: { level: "bad" | "warn" | "info"; text: string }[] = [];

    const alg = String(header.alg ?? "");
    if (/^none$/i.test(alg))
      notes.push({
        level: "bad",
        text: "alg is \"none\" — this token carries no signature at all. If a server accepts it, anyone can mint tokens claiming to be anyone.",
      });
    if (/^HS/i.test(alg))
      notes.push({
        level: "info",
        text: `${alg} is symmetric: the same secret verifies and signs. Anything holding it to verify can also forge. Asymmetric (RS/ES) is safer when more than one service validates tokens.`,
      });
    if (payload.exp && Number(payload.exp) < now)
      notes.push({ level: "bad", text: `Expired ${Math.round((now - Number(payload.exp)) / 60)} minutes ago.` });
    if (!payload.exp)
      notes.push({ level: "warn", text: "No exp claim — this token never expires on its own. Revocation becomes the only way to end a session." });
    if (payload.exp && payload.iat && Number(payload.exp) - Number(payload.iat) > 60 * 60 * 24 * 30)
      notes.push({ level: "warn", text: "Lifetime is longer than 30 days. A stolen token stays useful for a very long time." });
    if (!payload.aud) notes.push({ level: "info", text: "No aud claim — nothing stops this token being replayed at a different service that trusts the same issuer." });

    const fmt = (k: string, v: unknown) =>
      TIME_CLAIMS.has(k) && typeof v === "number"
        ? `${v}  →  ${new Date(v * 1000).toISOString().replace("T", " ").slice(0, 19)}Z`
        : JSON.stringify(v);

    return { header, payload, notes, fmt, hasSig: parts.length === 3 && Boolean(parts[2]) };
  }, [raw]);

  return (
    <div>
      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        rows={4}
        spellCheck={false}
        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0In0.dBjftJeZ4CVP…"
        className="w-full rounded-lg border border-line bg-panel/60 px-4 py-3 font-mono text-[13px] text-ink outline-none placeholder:text-dim/40 focus:border-acid/60 break-all"
      />
      {LOCAL_NOTE}

      {out && "error" in out && (
        <div className="mt-5 card-line rounded-xl p-5 border-red-500/40">
          <p className="text-sm text-ink">{out.error}</p>
        </div>
      )}

      {out && !("error" in out) && (
        <>
          {out.notes.length > 0 && (
            <Box label="What stands out">
              <ul className="space-y-2">
                {out.notes.map((n) => (
                  <li key={n.text} className="flex gap-2.5 text-sm leading-relaxed">
                    <span
                      className={
                        n.level === "bad" ? "text-red-400" : n.level === "warn" ? "text-yellow-400" : "text-dim"
                      }
                    >
                      {n.level === "bad" ? "×" : n.level === "warn" ? "!" : "·"}
                    </span>
                    <span className="text-dim">{n.text}</span>
                  </li>
                ))}
              </ul>
            </Box>
          )}

          <Box label="Header">
            <pre className="overflow-x-auto font-mono text-[12px] text-dim">
              {JSON.stringify(out.header, null, 2)}
            </pre>
          </Box>

          <Box label="Payload">
            <div className="space-y-1.5">
              {Object.entries(out.payload).map(([k, v]) => (
                <div key={k} className="flex flex-col sm:flex-row sm:gap-4 font-mono text-[12px]">
                  <span className="text-acid sm:w-40 shrink-0">{k}</span>
                  <span className="text-dim break-all">{out.fmt(k, v)}</span>
                </div>
              ))}
            </div>
          </Box>

          <p className="mt-4 text-[13px] text-dim leading-relaxed">
            {out.hasSig
              ? "The signature is present but not verified — that needs the secret or public key, which this page deliberately never asks for."
              : "No signature segment is present on this token."}
          </p>
        </>
      )}
    </div>
  );
}

/* ── CVSS 3.1 calculator ──────────────────────────────────────────────── */

const METRICS = [
  { id: "AV", name: "Attack Vector", opts: [["N", "Network"], ["A", "Adjacent"], ["L", "Local"], ["P", "Physical"]] },
  { id: "AC", name: "Attack Complexity", opts: [["L", "Low"], ["H", "High"]] },
  { id: "PR", name: "Privileges Required", opts: [["N", "None"], ["L", "Low"], ["H", "High"]] },
  { id: "UI", name: "User Interaction", opts: [["N", "None"], ["R", "Required"]] },
  { id: "S", name: "Scope", opts: [["U", "Unchanged"], ["C", "Changed"]] },
  { id: "C", name: "Confidentiality", opts: [["H", "High"], ["L", "Low"], ["N", "None"]] },
  { id: "I", name: "Integrity", opts: [["H", "High"], ["L", "Low"], ["N", "None"]] },
  { id: "A", name: "Availability", opts: [["H", "High"], ["L", "Low"], ["N", "None"]] },
] as const;

const W = {
  AV: { N: 0.85, A: 0.62, L: 0.55, P: 0.2 },
  AC: { L: 0.77, H: 0.44 },
  PR_U: { N: 0.85, L: 0.62, H: 0.27 },
  PR_C: { N: 0.85, L: 0.68, H: 0.5 },
  UI: { N: 0.85, R: 0.62 },
  CIA: { H: 0.56, L: 0.22, N: 0 },
} as const;

/** CVSS defines its own rounding; Math.ceil on floats gives wrong scores. */
function roundUp(x: number): number {
  const i = Math.round(x * 100000);
  return i % 10000 === 0 ? i / 100000 : (Math.floor(i / 10000) + 1) / 10;
}

function severity(score: number) {
  if (score === 0) return { label: "None", cls: "text-dim" };
  if (score < 4) return { label: "Low", cls: "text-acid" };
  if (score < 7) return { label: "Medium", cls: "text-yellow-400" };
  if (score < 9) return { label: "High", cls: "text-orange-400" };
  return { label: "Critical", cls: "text-red-400" };
}

export function CvssCalculator() {
  const [v, setV] = useState<Record<string, string>>({
    AV: "N", AC: "L", PR: "N", UI: "N", S: "U", C: "H", I: "H", A: "H",
  });

  const { score, vector } = useMemo(() => {
    const iss =
      1 -
      (1 - W.CIA[v.C as keyof typeof W.CIA]) *
        (1 - W.CIA[v.I as keyof typeof W.CIA]) *
        (1 - W.CIA[v.A as keyof typeof W.CIA]);
    const changed = v.S === "C";
    const impact = changed
      ? 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15)
      : 6.42 * iss;
    const pr = changed ? W.PR_C[v.PR as keyof typeof W.PR_C] : W.PR_U[v.PR as keyof typeof W.PR_U];
    const expl = 8.22 * W.AV[v.AV as keyof typeof W.AV] * W.AC[v.AC as keyof typeof W.AC] * pr * W.UI[v.UI as keyof typeof W.UI];
    const base = impact <= 0 ? 0 : roundUp(Math.min(changed ? 1.08 * (impact + expl) : impact + expl, 10));
    return {
      score: base,
      vector: `CVSS:3.1/${METRICS.map((m) => `${m.id}:${v[m.id]}`).join("/")}`,
    };
  }, [v]);

  const sev = severity(score);

  return (
    <div>
      <div className="card-line rounded-xl p-6 flex flex-wrap items-center gap-6">
        <div className="font-display font-bold text-6xl tabular-nums">{score.toFixed(1)}</div>
        <div>
          <div className={`font-mono text-sm tracking-[0.2em] ${sev.cls}`}>{sev.label.toUpperCase()}</div>
          <div className="mt-1 font-mono text-[11px] text-dim break-all">{vector}</div>
        </div>
      </div>
      {LOCAL_NOTE}

      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        {METRICS.map((m) => (
          <div key={m.id} className="card-line rounded-xl p-4">
            <div className="font-mono text-[11px] text-dim uppercase tracking-wider">{m.name}</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {m.opts.map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setV((s) => ({ ...s, [m.id]: val }))}
                  className={`rounded px-2.5 py-1 font-mono text-[11px] transition-colors ${
                    v[m.id] === val
                      ? "bg-acid text-void font-bold"
                      : "border border-line text-dim hover:text-ink hover:border-dim"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 text-[13px] text-dim leading-relaxed">
        This is the <strong className="text-ink">base</strong> score only — the intrinsic
        properties of the flaw, with no allowance for your environment. A base 9.8 behind three
        other controls is not a 9.8 to you, and a base 5.3 that exposes your entire customer
        table is not a 5.3 either. CVSS is a useful input and a poor output; adjust it for
        context and say that you have.
      </p>
    </div>
  );
}

/* ── Hash identifier ──────────────────────────────────────────────────── */

const HASHES: { re: RegExp; names: string[]; note?: string }[] = [
  { re: /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/, names: ["bcrypt"], note: "Deliberately slow and salted. This is what you want to see." },
  { re: /^\$argon2(id|i|d)\$/, names: ["Argon2"], note: "Memory-hard and current best practice." },
  { re: /^\$6\$/, names: ["SHA-512 crypt"], note: "Unix shadow format, salted and iterated." },
  { re: /^\$5\$/, names: ["SHA-256 crypt"] },
  { re: /^\$1\$/, names: ["MD5 crypt"], note: "Long obsolete for password storage." },
  { re: /^\$y\$|^\$7\$/, names: ["yescrypt / scrypt"] },
  { re: /^[a-f0-9]{32}$/i, names: ["MD5", "NTLM", "MD4", "LM (half)"], note: "Length alone cannot separate these. NTLM is uppercase-hex by convention; context usually decides. All are unsalted and fast — unsuitable for passwords." },
  { re: /^[a-f0-9]{40}$/i, names: ["SHA-1", "MySQL5 (without *)"], note: "SHA-1 is collision-broken and unsalted." },
  { re: /^\*[A-F0-9]{40}$/i, names: ["MySQL 4.1+"] },
  { re: /^[a-f0-9]{56}$/i, names: ["SHA-224", "SHA3-224"] },
  { re: /^[a-f0-9]{64}$/i, names: ["SHA-256", "SHA3-256", "BLAKE2s"], note: "Fast and unsalted. Fine for integrity, wrong for passwords." },
  { re: /^[a-f0-9]{96}$/i, names: ["SHA-384", "SHA3-384"] },
  { re: /^[a-f0-9]{128}$/i, names: ["SHA-512", "SHA3-512", "BLAKE2b", "Whirlpool"] },
  { re: /^[a-f0-9]{16}$/i, names: ["MySQL 3.x", "CRC-64", "DES(Unix) truncated"] },
  { re: /^[A-Za-z0-9+/]{27}=$/, names: ["SHA-1 (base64)"] },
  { re: /^[A-Za-z0-9+/]{43}=$/, names: ["SHA-256 (base64)"] },
];

export function HashIdentifier() {
  const [raw, setRaw] = useState("");
  const hash = raw.trim();
  const matches = hash ? HASHES.filter((h) => h.re.test(hash)) : [];

  return (
    <div>
      <input
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        spellCheck={false}
        autoCapitalize="none"
        autoCorrect="off"
        placeholder="5f4dcc3b5aa765d61d8327deb882cf99"
        className="w-full rounded-lg border border-line bg-panel/60 px-4 py-3 font-mono text-[13px] text-ink outline-none placeholder:text-dim/40 focus:border-acid/60"
      />
      {LOCAL_NOTE}

      {hash && (
        <Box label={matches.length ? "Likely formats" : "No match"}>
          {matches.length ? (
            <div className="space-y-4">
              {matches.map((m) => (
                <div key={m.names.join()}>
                  <div className="font-medium text-ink">{m.names.join(" · ")}</div>
                  {m.note && <p className="mt-1 text-sm text-dim leading-relaxed">{m.note}</p>}
                </div>
              ))}
              <p className="text-[13px] text-dim leading-relaxed border-t border-line/70 pt-3">
                Identification is by length and character set, which is all any tool can do
                without the input. Where several formats share a shape, they are all listed
                rather than guessing — a confident wrong answer here wastes hours.
              </p>
            </div>
          ) : (
            <p className="text-sm text-dim leading-relaxed">
              Nothing matches that length and character set. It may be truncated, encoded
              rather than hashed, or a format not in this list — {hash.length} characters,{" "}
              {/^[a-f0-9]+$/i.test(hash) ? "hex" : /^[A-Za-z0-9+/=]+$/.test(hash) ? "base64-ish" : "mixed"}.
            </p>
          )}
        </Box>
      )}
    </div>
  );
}
