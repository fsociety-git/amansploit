import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { TEMPLATES } from "@/lib/templates";

const URL = "https://amansploit.com/templates";
const DESCRIPTION =
  "Free, plain-English engagement paperwork for penetration testing: a rules of engagement template and a mutual NDA. Readable, printable, and downloadable as Word documents.";

export const metadata: Metadata = {
  title: "Free Pentest Rules of Engagement & NDA Templates | amansploit",
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: "Engagement templates", description: DESCRIPTION, url: URL, siteName: "amansploit", type: "website" },
  twitter: { card: "summary_large_image" },
};

export default async function Page() {
  await connection();
  return (
    <>
      <Nav />
      <main className="flex-1 bg-void">
        <div className="mx-auto max-w-3xl px-5 pt-32 pb-20">
          <div className="kicker">// TEMPLATES</div>
          <h1 className="mt-3 font-display font-bold text-4xl md:text-5xl tracking-tight">
            The paperwork, written to be read.
          </h1>
          <p className="mt-4 text-lg text-dim leading-relaxed">
            Two documents every security engagement should have and most small ones skip. They
            are here in full, free to take and adapt, because an engagement that goes wrong
            usually goes wrong on something nobody wrote down first.
          </p>

          <div className="mt-10 space-y-4">
            {TEMPLATES.map((t) => (
              <div key={t.slug} className="card-line rounded-xl p-6">
                <h2 className="font-display font-bold text-xl">{t.title}</h2>
                <p className="mt-2 text-[15px] text-dim leading-relaxed">{t.blurb}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={`/templates/${t.slug}`} className="rounded-lg bg-acid text-void font-semibold px-5 py-2.5 text-sm hover:bg-acid/85 transition-colors">
                    Read it →
                  </Link>
                  <a href={`/templates/${t.slug}.docx`} className="rounded-lg border border-line px-5 py-2.5 text-sm text-dim hover:text-ink hover:border-dim transition-colors">
                    Download .docx
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 card-line rounded-xl p-6">
            <div className="kicker mb-2">Before you use these</div>
            <p className="text-sm text-dim leading-relaxed">
              The rules of engagement document is operational and I stand behind it — it is the
              one I use. The NDA is a starting point rather than legal advice; I am not a
              lawyer, and a contract you have not had reviewed is a contract you are guessing
              about. Both are deliberately short, because paperwork nobody reads protects
              nobody.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
