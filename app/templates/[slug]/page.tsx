import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { TEMPLATES, templateBySlug } from "@/lib/templates";

export async function generateStaticParams() {
  return TEMPLATES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = templateBySlug(slug);
  if (!t) return {};
  const url = `https://amansploit.com/templates/${t.slug}`;
  return {
    title: `${t.title} Template — Free | amansploit`,
    description: t.blurb,
    alternates: { canonical: url },
    openGraph: { title: t.title, description: t.blurb, url, siteName: "amansploit", type: "website" },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const t = templateBySlug(slug);
  if (!t) notFound();

  return (
    <>
      <Nav />
      <main className="flex-1 bg-void">
        <div className="mx-auto max-w-3xl px-5 pt-32 pb-20">
          <Link href="/templates" className="font-mono text-xs text-dim hover:text-acid transition-colors">
            ← all templates
          </Link>
          <h1 className="mt-8 font-display font-bold text-4xl tracking-tight">{t.title}</h1>
          <p className="mt-4 text-lg text-dim leading-relaxed">{t.blurb}</p>

          <div className="mt-6 flex flex-wrap gap-3 print:hidden">
            <a href={`/templates/${t.slug}.docx`} className="rounded-lg bg-acid text-void font-semibold px-5 py-2.5 text-sm hover:bg-acid/85 transition-colors">
              Download .docx
            </a>
          </div>

          <div className="mt-8 card-line rounded-xl p-5 border-yellow-500/30">
            <div className="kicker mb-2 text-yellow-400">Read this first</div>
            <p className="text-sm text-dim leading-relaxed">{t.caveat}</p>
          </div>

          <div className="mt-10 space-y-8">
            {t.clauses.map((c) => (
              <section key={c.h}>
                <h2 className="font-display font-bold text-xl tracking-tight">{c.h}</h2>
                {c.p.map((para, i) =>
                  para === "" ? (
                    <div key={i} className="h-2" />
                  ) : (
                    <p key={i} className="mt-3 text-[15px] text-dim leading-relaxed">{para}</p>
                  ),
                )}
                {c.items && (
                  <ul className="mt-3 space-y-2">
                    {c.items.map((it) => (
                      <li key={it} className="flex gap-2.5 text-[15px] text-dim leading-relaxed">
                        <span className="text-acid shrink-0">▸</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <p className="mt-12 pt-8 border-t border-line text-[15px] text-dim leading-relaxed">
            Anything in square brackets is meant to be replaced. If you want a hand adapting
            this to a specific engagement,{" "}
            <Link href="/#contact" className="text-acid hover:underline">ask</Link> — it costs
            nothing to answer a question about a document I published for free.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
