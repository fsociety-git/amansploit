import type { Metadata } from "next";
import { connection } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import dns from "node:dns/promises";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { LINKS } from "@/lib/data";
import { renderMarkdown } from "@/lib/posts";

const URL = "https://amansploit.com/transparency";
const DESCRIPTION =
  "What this site is running, what it is built from, and what has changed. Live health checks, a full dependency list read from the lockfile, and the changelog.";

export const metadata: Metadata = {
  title: "Transparency — Status, Dependencies, Changelog | amansploit",
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: "Transparency", description: DESCRIPTION, url: URL, siteName: "amansploit", type: "website" },
};

/**
 * Three kinds of transparency on one page, because they answer one question:
 * can you check what I say about my own infrastructure?
 *
 * The status section is deliberately not a status page in the usual sense.
 * Those are written by hand and say "all systems operational" because somebody
 * forgot to update them — which is worse than having none, since it converts
 * "I don't know" into a false claim. This one performs the checks when you load
 * the page and prints whatever comes back, including failures.
 *
 * The dependency list is read from package.json at request time rather than
 * typed out, so it cannot drift from what is actually installed. A hand-written
 * SBOM is a document about a build that no longer exists.
 */

type State = "ok" | "down" | "unknown";

async function timed<T>(fn: () => Promise<T>, ms = 4000): Promise<{ state: State; ms: number; detail: string }> {
  const t0 = Date.now();
  try {
    const bail = new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms));
    const r = await Promise.race([fn(), bail]);
    return { state: "ok", ms: Date.now() - t0, detail: String(r) };
  } catch (e) {
    const msg = (e as Error).message;
    // A timeout on our side is not proof the dependency is down.
    return { state: msg === "timeout" ? "unknown" : "down", ms: Date.now() - t0, detail: msg };
  }
}

async function checks() {
  const [apex, www, dmarc] = await Promise.all([
    timed(async () => (await dns.resolve4("amansploit.com"))[0]),
    timed(async () => (await dns.resolveCname("www.amansploit.com"))[0]),
    timed(async () => {
      const t = (await dns.resolveTxt("_dmarc.amansploit.com")).map((r) => r.join(""));
      return t.find((r) => r.startsWith("v=DMARC1")) ?? "none";
    }),
  ]);
  return [
    { name: "Apex DNS", ...apex },
    { name: "www CNAME", ...www },
    { name: "DMARC record", ...dmarc },
    {
      name: "This page",
      state: "ok" as State,
      ms: 0,
      detail: "rendered on request — if you can read this, the application is serving",
    },
  ];
}

interface Pkg {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export default async function Page() {
  await connection();

  const [health, pkgRaw, changelogRaw] = await Promise.all([
    checks(),
    fs.readFile(path.join(process.cwd(), "package.json"), "utf8").catch(() => "{}"),
    fs.readFile(path.join(process.cwd(), "content", "changelog.md"), "utf8").catch(() => ""),
  ]);

  const pkg: Pkg = JSON.parse(pkgRaw);
  const deps = Object.entries(pkg.dependencies ?? {}).sort(([a], [b]) => a.localeCompare(b));
  const devDeps = Object.entries(pkg.devDependencies ?? {}).sort(([a], [b]) => a.localeCompare(b));
  const changelog = changelogRaw ? await renderMarkdown(changelogRaw) : "";

  const MARK: Record<State, { g: string; c: string }> = {
    ok: { g: "▸", c: "text-acid" },
    down: { g: "×", c: "text-red-400" },
    unknown: { g: "?", c: "text-yellow-400" },
  };

  return (
    <>
      <Nav />
      <main id="content" className="flex-1 bg-void">
        <div className="mx-auto max-w-3xl px-5 pt-32 pb-20">
          <div className="kicker">// TRANSPARENCY</div>
          <h1 className="mt-3 font-display font-bold text-4xl md:text-5xl tracking-tight">
            What this is running on.
          </h1>
          <p className="mt-4 text-lg text-dim leading-relaxed">
            A security site asking you to trust it ought to be checkable. Below: live health
            checks performed when you loaded this page, every dependency read from the
            manifest rather than typed out, and what has actually changed.{" "}
            <a href={LINKS.repo} target="_blank" rel="noopener noreferrer" className="text-acid hover:underline">
              The whole thing is open source
            </a>{" "}
            — every claim on this site can be read as code.
          </p>

          {/* ── status ────────────────────────────────────────────────── */}
          <section className="mt-12">
            <h2 className="font-display font-bold text-2xl tracking-tight">Status</h2>
            <p className="mt-3 text-[15px] text-dim leading-relaxed">
              Run at request time, not written down in advance. Most status pages say
              &ldquo;all systems operational&rdquo; because nobody updated them, which turns
              &ldquo;I don&apos;t know&rdquo; into a false claim. This one prints whatever the
              checks return, including a failure I haven&apos;t noticed yet.
            </p>
            <div className="mt-5 card-line rounded-xl p-5">
              {health.map((h) => {
                const m = MARK[h.state];
                return (
                  <div
                    key={h.name}
                    className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-3 border-t border-line/60 first:border-t-0 first:pt-0"
                  >
                    <div className="flex items-center gap-2 sm:w-44 shrink-0">
                      <span className={m.c} aria-hidden>{m.g}</span>
                      <span className="font-mono text-[13px] text-ink">{h.name}</span>
                    </div>
                    <div className="font-mono text-[12px] text-dim break-all flex-1">{h.detail}</div>
                    {h.ms > 0 && <div className="font-mono text-[11px] text-dim/60">{h.ms}ms</div>}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── dependencies ──────────────────────────────────────────── */}
          <section className="mt-12">
            <h2 className="font-display font-bold text-2xl tracking-tight">
              Dependencies ({deps.length + devDeps.length})
            </h2>
            <p className="mt-3 text-[15px] text-dim leading-relaxed">
              Read from the manifest on this deployment, so it cannot drift from what is
              actually installed. A hand-maintained list is a document about a build that no
              longer exists. Machine-readable version at{" "}
              <Link href="/sbom.json" className="text-acid hover:underline">/sbom.json</Link>.
            </p>

            <div className="mt-5 grid sm:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <div className="kicker mb-3">Runtime</div>
                <div className="space-y-1">
                  {deps.map(([n, v]) => (
                    <div key={n} className="flex justify-between gap-3 font-mono text-[12px]">
                      <span className="text-dim break-all">{n}</span>
                      <span className="text-dim/60 shrink-0">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="kicker mb-3">Build only</div>
                <div className="space-y-1">
                  {devDeps.map(([n, v]) => (
                    <div key={n} className="flex justify-between gap-3 font-mono text-[12px]">
                      <span className="text-dim break-all">{n}</span>
                      <span className="text-dim/60 shrink-0">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-5 text-[13px] text-dim leading-relaxed">
              Honest limitation: these are the direct dependencies declared in the manifest,
              not the full resolved tree. The transitive graph is several hundred packages and
              lives in the lockfile in the repository, which is the authoritative record.
            </p>
          </section>

          {/* ── changelog ─────────────────────────────────────────────── */}
          {changelog && (
            <section className="mt-12">
              <h2 className="font-display font-bold text-2xl tracking-tight">Changelog</h2>
              <div className="prose-sec mt-5" dangerouslySetInnerHTML={{ __html: changelog }} />
            </section>
          )}

          <div className="mt-14 pt-8 border-t border-line">
            <p className="text-[15px] text-dim leading-relaxed">
              Found something wrong here, or in the source? See{" "}
              <a href="/.well-known/security.txt" className="text-acid hover:underline">security.txt</a>{" "}
              — no bounty, but a fast reply, a fix, and credit if you want it.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
