import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { formatDate, getPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Writing | amansploit",
  description:
    "Notes on penetration testing, email security, and building security tooling — by Aman Sonkamble.",
  alternates: {
    canonical: "https://amansploit.com/blog",
    types: { "application/rss+xml": "https://amansploit.com/feed.xml" },
  },
};

export default async function BlogIndex() {
  await connection();
  const posts = await getPosts();

  return (
    <>
      <Nav />
      <main id="content" className="flex-1 bg-void">
        <div className="mx-auto max-w-3xl px-5 pt-32 pb-20">
          <div className="kicker">// WRITING</div>
          <h1 className="mt-3 font-display font-bold text-4xl md:text-5xl tracking-tight">
            Notes from the work.
          </h1>
          <p className="mt-4 text-lg text-dim leading-relaxed">
            Mostly things I found myself explaining twice — how to buy a penetration test,
            why your domain is probably spoofable, and how the tooling I build actually works.
          </p>

          {posts.length === 0 ? (
            <p className="mt-12 text-dim">Nothing published yet.</p>
          ) : (
            <div className="mt-12 space-y-4">
              {posts.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} prefetch={false} className="block card-line card-hover rounded-xl p-6">
                  <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-dim">
                    <time dateTime={p.date}>{formatDate(p.date)}</time>
                    <span>·</span>
                    <span>{p.readingMinutes} min read</span>
                    {p.draft && <span className="text-yellow-400">· draft</span>}
                    {p.generated && <span title="Scheduled explainer, published unreviewed">· scheduled</span>}
                  </div>
                  <h2 className="mt-2 font-display font-bold text-xl leading-snug">{p.title}</h2>
                  <p className="mt-2 text-[15px] text-dim leading-relaxed">{p.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <span key={t} className="font-mono text-[10px] text-acid/80 border border-acid/25 rounded px-2 py-0.5">
                        {t}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}

          <p className="mt-10 font-mono text-xs text-dim">
            <a href="/feed.xml" className="hover:text-acid transition-colors">RSS feed →</a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
