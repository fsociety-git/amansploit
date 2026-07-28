import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

/**
 * A 404 in the site's own voice. The joke has to survive being read by someone
 * who is lost and mildly annoyed, so it stays short and the useful links come
 * immediately after.
 *
 * Rendered as static markup rather than a typing animation: a 404 that animates
 * before showing you where to go is a worse 404.
 */
const LINES: [string, string][] = [
  ["$", "GET /this-page"],
  ["", "404 Not Found"],
  ["", ""],
  ["#", "Nothing here. Either it moved, or you found"],
  ["#", "a path I never published — which, on this"],
  ["#", "site of all sites, is a fair thing to look for."],
  ["", ""],
  ["#", "If it was the second one, I'd genuinely like"],
  ["#", "to hear about it: /.well-known/security.txt"],
];

const GOING = [
  { href: "/", label: "Home", desc: "What I do and what it costs" },
  { href: "/tools", label: "Free tools", desc: "Check your headers or your email spoofability" },
  { href: "/blog", label: "Writing", desc: "How to buy security work without being sold to" },
  { href: "/sample-penetration-test-report.pdf", label: "Sample report", desc: "The actual deliverable, in full" },
];

export default function NotFound() {
  return (
    <>
      <Nav />
      <main id="content" className="flex-1 bg-void">
        <div className="mx-auto max-w-3xl px-5 pt-32 pb-24">
          <div className="rounded-xl border border-line bg-panel/50 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-line/70">
              <span className="w-3 h-3 rounded-full bg-red-400/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
              <span className="w-3 h-3 rounded-full bg-acid/70" />
              <span className="ml-3 font-mono text-[11px] text-dim">amansploit.com — 404</span>
            </div>
            <pre className="px-5 py-6 font-mono text-[13px] leading-relaxed overflow-x-auto">
              {LINES.map(([sigil, text], i) => (
                <div key={i}>
                  {sigil === "$" && <span className="text-acid">$ </span>}
                  {sigil === "#" && <span className="text-dim">{"# "}</span>}
                  <span className={sigil === "#" ? "text-dim" : "text-ink"}>{text}</span>
                </div>
              ))}
            </pre>
          </div>

          <h1 className="mt-12 font-display font-bold text-3xl tracking-tight">
            Somewhere useful instead:
          </h1>
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            {GOING.map((g) => (
              <Link
                key={g.href}
                href={g.href}
                className="block card-line card-hover rounded-xl p-5"
              >
                <div className="font-display font-bold text-lg">{g.label}</div>
                <p className="mt-1 text-sm text-dim leading-relaxed">{g.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
