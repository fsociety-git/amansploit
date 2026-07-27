import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { CASES, LINKS } from "@/lib/data";

export function generateStaticParams() {
  return CASES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = CASES.find((x) => x.slug === slug);
  if (!c) return {};
  return {
    title: `${c.title} — Case Study | Aman Sonkamble`,
    description: c.problem,
    alternates: { canonical: `https://amansploit.com/work/${c.slug}` },
    openGraph: { title: c.title, description: c.problem, type: "article" },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Nonce-based CSP (proxy.ts) needs a per-request render.
  await connection();

  const { slug } = await params;
  const c = CASES.find((x) => x.slug === slug);
  if (!c) notFound();

  const idx = CASES.findIndex((x) => x.slug === slug);
  const next = CASES[(idx + 1) % CASES.length];

  return (
    <>
      <Nav />
      <main className="flex-1 bg-void">
        {/* header */}
        <header className="relative border-b border-line bg-grid">
          <div className="absolute inset-0 glow-acid" aria-hidden="true" />
          <div className="relative mx-auto max-w-3xl px-5 pt-32 pb-16">
            <Link
              href="/#work"
              className="font-mono text-xs text-dim hover:text-acid transition-colors"
            >
              ← all work
            </Link>
            <div className="kicker mt-8">{c.kicker}</div>
            <h1 className="mt-3 font-display font-bold text-4xl md:text-5xl leading-[1.05] tracking-tight">
              {c.title}
            </h1>
            <p className="mt-5 text-lg text-dim leading-relaxed">{c.problem}</p>
            <div className="mt-7 flex flex-wrap gap-2">
              {c.stack.map((t) => (
                <span
                  key={t}
                  className="font-mono text-[11px] text-acid/80 border border-acid/25 rounded px-2.5 py-1"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* outcome callout */}
        <div className="mx-auto max-w-3xl px-5">
          <div className="card-line rounded-xl p-6 md:p-7 -mt-8 relative z-10">
            <div className="kicker mb-2">Outcome</div>
            <p className="text-ink leading-relaxed">{c.result}</p>
          </div>
        </div>

        {/* body */}
        <article className="mx-auto max-w-3xl px-5 py-16">
          {c.body.map((s, i) => (
            <Reveal key={s.h} delay={i * 0.04}>
              <section className="mb-10">
                <h2 className="font-display font-bold text-2xl tracking-tight">{s.h}</h2>
                <p className="mt-3 text-dim leading-[1.75]">{s.p}</p>
              </section>
            </Reveal>
          ))}
        </article>

        {/* next + CTA */}
        <div className="border-t border-line bg-panel/40">
          <div className="mx-auto max-w-3xl px-5 py-14 flex flex-col sm:flex-row gap-8 sm:items-center sm:justify-between">
            <div>
              <div className="font-mono text-xs text-dim uppercase tracking-wider">Next case study</div>
              <Link
                href={`/work/${next.slug}`}
                className="mt-1 block font-display font-bold text-xl hover:text-acid transition-colors"
              >
                {next.title} →
              </Link>
            </div>
            <a
              href={`mailto:${LINKS.email}?subject=Project%20inquiry`}
              className="shrink-0 rounded-lg bg-acid text-void font-semibold px-6 py-3 hover:bg-acid/85 transition-colors text-center"
            >
              Start a project
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
