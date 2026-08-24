import Link from "next/link";
import type { T } from "@/lib/shield/i18n";

export function ShieldMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 2.5 4.5 7.2v9.1c0 6.9 4.8 11.8 11.5 13.9 6.7-2.1 11.5-7 11.5-13.9V7.2L16 2.5Z"
        stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="rgba(45,224,179,.07)"
      />
      <path d="M11 15.8l3.5 3.6L21.5 12" stroke="currentColor" strokeWidth="2.1"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Wordmark({ small = false }: { small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-acid">
      <ShieldMark size={small ? 20 : 26} />
      <span className="font-display font-bold tracking-tight text-ink" style={{ fontSize: small ? 16 : 20 }}>
        Shield
      </span>
      <span className="font-mono text-[10px] text-dim tracking-wider">by amansploit</span>
    </span>
  );
}

export function Footer({ t }: { t: T }) {
  return (
    <footer className="border-t border-line mt-16">
      <div className="mx-auto max-w-2xl px-5 py-8 flex flex-col items-center gap-3 text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-0 font-mono text-xs text-dim">
          <Link href="/shield/guide" className="tap px-1 hover:text-acid transition-colors">{t("footer.guide")}</Link>
          <Link href="/shield/about" className="tap px-1 hover:text-acid transition-colors">{t("footer.about")}</Link>
          <a href="https://amansploit.com" target="_blank" rel="noopener noreferrer"
             className="tap px-1 hover:text-acid transition-colors">amansploit.com</a>
        </div>
        <p className="font-mono text-[11px] text-dim/70">
          {t("brand.footer")} ·{" "}
          <a href="https://amansploit.com" target="_blank" rel="noopener noreferrer" className="hover:text-acid">
            amansploit.com
          </a>
        </p>
      </div>
    </footer>
  );
}
