import Link from "next/link";
import { Wordmark, Footer } from "@/components/shield/Brand";
import { getDict } from "@/lib/shield/i18n";
import { preferredLocale } from "@/lib/shield/net";

export const metadata = {
  title: "Making yourself harder to impersonate — Shield by amansploit",
  description:
    "Practical steps that make a convincing fake account much harder to build: handle-variant squatting, similar-account suggestions, two-factor, and what to tell your contacts in advance.",
};

export default async function Guide() {
  const locale = await preferredLocale();
  const t = getDict(locale);
  const steps = ["s1", "s2", "s3", "s4", "s5", "s6"];

  return (
    <>
      <header className="mx-auto max-w-2xl px-5 pt-6"><Wordmark small /></header>
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-5 pt-10 pb-10">
          <h1 className="font-display font-bold text-3xl leading-tight tracking-tight">{t("guide.title")}</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-dim">{t("guide.sub")}</p>

          <div className="mt-9 space-y-3">
            {steps.map((k, i) => (
              <section key={k} className="card p-5">
                <div className="flex gap-4">
                  <span className="font-mono text-xs text-acid pt-1">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h2 className="font-display font-bold text-[17px] leading-snug">{t(`guide.${k}`)}</h2>
                    <p className="mt-2 text-[15px] leading-relaxed text-dim">{t(`guide.${k}D`)}</p>
                  </div>
                </div>
              </section>
            ))}
          </div>

          <Link href="/shield/new" className="tap mt-10 w-full rounded-xl bg-acid px-6 py-4 text-lg font-semibold text-void">
            {t("home.cta")}
          </Link>
        </div>
      </main>
      <Footer t={t} />
    </>
  );
}
