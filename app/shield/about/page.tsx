import { Wordmark, Footer } from "@/components/shield/Brand";
import { getDict } from "@/lib/shield/i18n";
import { preferredLocale } from "@/lib/shield/net";

export const metadata = {
  title: "About Shield — by amansploit",
  description: "Why Shield exists, what it deliberately cannot do, what it stores, and why verification is required.",
};

export default async function About() {
  const locale = await preferredLocale();
  const t = getDict(locale);

  const blocks = [
    { k: "freeTitle", b: "free" },
    { k: "honestTitle", b: "honest" },
    { k: "verifyTitle", b: "verify" },
    { k: "privacyTitle", b: "privacy" },
    { k: "legalTitle", b: "legal" },
  ];

  return (
    <>
      <header className="mx-auto max-w-2xl px-5 pt-6"><Wordmark small /></header>
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-5 pt-10 pb-10">
          <h1 className="font-display font-bold text-3xl tracking-tight">{t("about.title")}</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-dim">{t("about.mission")}</p>

          <div className="mt-9 space-y-3">
            {blocks.map(({ k, b }) => (
              <section key={k} className="card p-5">
                <h2 className="font-display font-bold text-[16px]">{t(`about.${k}`)}</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-dim">{t(`about.${b}`)}</p>
              </section>
            ))}
          </div>

          <p className="mt-9 text-center font-mono text-[11px] text-dim">
            <a href="https://amansploit.com" target="_blank" rel="noopener noreferrer" className="hover:text-acid">
              amansploit.com →
            </a>
          </p>
        </div>
      </main>
      <Footer t={t} />
    </>
  );
}
