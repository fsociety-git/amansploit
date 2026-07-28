import { LINKS } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-void">
      <div className="mx-auto max-w-6xl px-5 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="font-mono text-sm">
          <span className="text-acid">aman</span>sploit
          <span className="text-dim"> — security engineering & development</span>
        </div>
        {/* flex-wrap is load-bearing. Six links at gap-6 measure 487px, which is
            wider than a 375px phone — and because they cannot wrap, the layout
            viewport expands to fit them on EVERY page, pushing the right-hand
            edge of the whole site off-screen. One missing utility, site-wide
            symptom. */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-0 font-mono text-xs text-dim">
          <a href={`mailto:${LINKS.email}`} className="inline-flex items-center min-h-[44px] px-1 hover:text-acid transition-colors">email</a>
          <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center min-h-[44px] px-1 hover:text-acid transition-colors">linkedin</a>
          <a href={LINKS.repo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center min-h-[44px] px-1 hover:text-acid transition-colors">source</a>
          <a href="/transparency" className="inline-flex items-center min-h-[44px] px-1 hover:text-acid transition-colors">transparency</a>
          <a href="/data-handling" className="inline-flex items-center min-h-[44px] px-1 hover:text-acid transition-colors">data handling</a>
          <a href="/.well-known/security.txt" className="inline-flex items-center min-h-[44px] px-1 hover:text-acid transition-colors">security.txt</a>
        </div>
        <div className="font-mono text-[11px] text-dim/60">
          © {new Date().getFullYear()} · built secure
        </div>
      </div>
    </footer>
  );
}
