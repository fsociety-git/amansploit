import { LINKS } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-void">
      <div className="mx-auto max-w-6xl px-5 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="font-mono text-sm">
          <span className="text-acid">aman</span>sploit
          <span className="text-dim"> — security engineering & development</span>
        </div>
        <div className="flex items-center gap-6 font-mono text-xs text-dim">
          <a href={`mailto:${LINKS.email}`} className="hover:text-acid transition-colors">email</a>
          <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-acid transition-colors">linkedin</a>
          <a href="/security.txt" className="hover:text-acid transition-colors">security.txt</a>
        </div>
        <div className="font-mono text-[11px] text-dim/60">
          © {new Date().getFullYear()} · built secure
        </div>
      </div>
    </footer>
  );
}
