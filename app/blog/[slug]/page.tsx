import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { formatDate, getPost, getPosts } from "@/lib/posts";
import { LINKS } from "@/lib/data";

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPost(slug);
  if (!p) return {};
  return {
    title: `${p.title} | amansploit`,
    description: p.description,
    alternates: { canonical: `https://amansploit.com/blog/${p.slug}` },
    openGraph: { title: p.title, description: p.description, type: "article", publishedTime: p.date },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const all = await getPosts();
  const next = all.find((p) => p.slug !== post.slug);

  return (
    <>
      <Nav />
      <main className="flex-1 bg-void">
        <article className="mx-auto max-w-3xl px-5 pt-32 pb-16">
          <Link href="/blog" className="font-mono text-xs text-dim hover:text-acid transition-colors">
            ← all writing
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-3 font-mono text-[11px] text-dim">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span>·</span>
            <span>{post.readingMinutes} min read</span>
          </div>
          <h1 className="mt-3 font-display font-bold text-3xl md:text-[2.6rem] leading-[1.1] tracking-tight">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-dim leading-relaxed">{post.description}</p>

          <div className="prose-sec mt-10" dangerouslySetInnerHTML={{ __html: post.html }} />

          {/* Disclosure. Cheaper to say it than to have someone work it out. */}
          {post.generated && (
            <aside className="mt-12 rounded-lg border border-line bg-panel/40 p-5">
              <div className="font-mono text-[11px] uppercase tracking-wider text-dim">
                How this post was written
              </div>
              <p className="mt-2 text-sm text-dim leading-relaxed">
                This is a scheduled explainer — drafted by a model I run against a fixed
                brief, published without a human pass. It explains mechanics only: it makes
                no claim about engagements I have run, no claim about any named company, and
                no claim about a specific vulnerability or event it cannot verify.{" "}
                <strong className="text-ink font-semibold">
                  The reports and assessments I sell are written by me, by hand.
                </strong>{" "}
                If anything here is wrong,{" "}
                <a href={`mailto:${LINKS.email}?subject=Correction`} className="text-acid hover:underline">
                  tell me
                </a>{" "}
                and I will fix or pull it.
              </p>
            </aside>
          )}

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                headline: post.title,
                description: post.description,
                datePublished: post.date,
                author: { "@type": "Person", name: "Aman Sonkamble", url: "https://amansploit.com" },
                mainEntityOfPage: `https://amansploit.com/blog/${post.slug}`,
              }),
            }}
          />
        </article>

        <div className="border-t border-line bg-panel/40">
          <div className="mx-auto max-w-3xl px-5 py-14 flex flex-col sm:flex-row gap-8 sm:items-center sm:justify-between">
            {next && (
              <div>
                <div className="font-mono text-xs text-dim uppercase tracking-wider">Read next</div>
                <Link href={`/blog/${next.slug}`} className="mt-1 block font-display font-bold text-xl hover:text-acid transition-colors">
                  {next.title} →
                </Link>
              </div>
            )}
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
