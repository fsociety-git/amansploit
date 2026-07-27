"use client";

import { useState } from "react";
import Link from "next/link";
import { LINKS, WHATSAPP } from "@/lib/data";
import { EmailResult, HeadersResult } from "./Results";

export default function ToolShell({
  title,
  kicker,
  intro,
  placeholder,
  endpoint,
  cta,
  variant,
}: {
  title: string;
  kicker: string;
  intro: string;
  placeholder: string;
  endpoint: string;
  cta: string;
  variant: "headers" | "email";
}) {
  const [target, setTarget] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!target.trim()) return;
    setState("loading");
    setError("");
    setData(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ target }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong.");
        setState("error");
        return;
      }
      setData(json);
      setState("done");
    } catch {
      setError("Could not reach the scanner.");
      setState("error");
    }
  }

  return (
    <main className="flex-1 bg-void">
      <div className="mx-auto max-w-3xl px-5 pt-32 pb-20">
        <Link href="/tools" className="font-mono text-xs text-dim hover:text-acid transition-colors">
          ← all tools
        </Link>

        <div className="kicker mt-8">{kicker}</div>
        <h1 className="mt-3 font-display font-bold text-4xl md:text-5xl tracking-tight">
          {title}
        </h1>
        <p className="mt-4 text-lg text-dim leading-relaxed">{intro}</p>

        <form onSubmit={run} className="mt-8 flex flex-col sm:flex-row gap-3">
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder={placeholder}
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            className="flex-1 rounded-lg border border-line bg-panel/60 px-4 py-3 font-mono text-sm text-ink outline-none placeholder:text-dim/50 focus:border-acid/60"
          />
          <button
            type="submit"
            disabled={state === "loading"}
            className="rounded-lg bg-acid text-void font-semibold px-6 py-3 hover:bg-acid/85 transition-colors disabled:opacity-50"
          >
            {state === "loading" ? "Checking…" : cta}
          </button>
        </form>

        <p className="mt-3 font-mono text-[11px] text-dim/70">
          Passive checks only — nothing is scanned, attacked, or stored.
        </p>

        {state === "error" && (
          <div className="mt-8 card-line rounded-xl p-5 border-red-500/40">
            <p className="text-sm text-ink">{error}</p>
          </div>
        )}

        {state === "done" && data && Boolean(data.blocked || data.inconclusive) && (
          <div className="mt-8 card-line rounded-xl p-6 border-yellow-500/40">
            <div className="kicker mb-2 text-yellow-400">Inconclusive</div>
            <p className="text-[15px] text-ink leading-relaxed">{typeof data.error === "string" ? data.error : "This check could not be completed."}</p>
            <p className="mt-3 text-sm text-dim">
              No grade is shown, because guessing would be worse than saying nothing.
            </p>
          </div>
        )}

        {state === "done" && data && !Boolean(data.blocked || data.inconclusive) && (
          <div className="mt-10">
            {variant === "headers" ? <HeadersResult d={data} /> : <EmailResult d={data} />}
          </div>
        )}

        {state === "done" && (
          <div className="mt-12 card-line rounded-xl p-6">
            <h2 className="font-display font-bold text-xl">Want the rest of the picture?</h2>
            <p className="mt-2 text-[15px] text-dim leading-relaxed">
              This checks one thin slice from the outside. A real assessment looks at
              authentication, access control, business logic, and the things a scanner
              cannot reach. Fixed price, report included, retest free.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-acid text-void font-semibold px-5 py-2.5 hover:bg-acid/85 transition-colors"
              >
                Talk it through
              </a>
              <Link
                href="/#estimate"
                className="rounded-lg border border-line text-ink font-medium px-5 py-2.5 hover:border-acid/50 hover:text-acid transition-colors"
              >
                Estimate my scope
              </Link>
              <a
                href={`mailto:${LINKS.email}`}
                className="rounded-lg border border-line text-ink font-medium px-5 py-2.5 hover:border-acid/50 hover:text-acid transition-colors"
              >
                Email me
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
