import Link from "next/link";
import { Wordmark, Footer, ShieldMark } from "@/components/shield/Brand";
import { getDict } from "@/lib/shield/i18n";
import { preferredLocale } from "@/lib/shield/net";

// Without this the page inherits the portfolio's title and a visitor in the
// middle of an impersonation sees a tab named after a security consultant.
export const metadata = {
  title: "Shield — someone made a fake account pretending to be you",
  description:
    "Free emergency response for social media impersonation in India. Get your contacts reporting the fake account within minutes, preserve the evidence, and draft your cybercrime complaint. No signup. English and Hindi.",
  alternates: { canonical: "https://amansploit.com/shield" },
  openGraph: {
    title: "Shield — impersonation response",
    description:
      "Someone made a fake account pretending to be you. Free, no signup, works on any phone.",
    url: "https://amansploit.com/shield",
    type: "website",
  },
};

export default async function Home() {
  const locale = await preferredLocale();
  const t = getDict(locale);

  const steps = [
    { n: "01", title: t("home.step1Title"), body: t("home.step1") },
    { n: "02", title: t("home.step2Title"), body: t("home.step2") },
    { n: "03", title: t("home.step3Title"), body: t("home.step3") },
  ];

  return (
    <>
      <header className="mx-auto max-w-2xl px-5 pt-6">
        <Wordmark />
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-5 pt-10 pb-4">
          <div className="kicker">{t("home.kicker")}</div>
          <h1 className="mt-4 font-display font-bold text-3xl sm:text-4xl leading-[1.15] tracking-tight">
            {t("home.title")}
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-dim">{t("home.sub")}</p>

          {/* The primary action is enormous and first. Someone arriving here is
              not browsing; they found this link in a panic and need one target. */}
          <Link
            href="/shield/new"
            className="tap mt-8 w-full rounded-xl bg-acid text-void font-semibold text-lg px-6 py-4 hover:bg-acid/85 transition-colors"
          >
            {t("home.cta")}
          </Link>

          <div className="mt-12 space-y-3">
            {steps.map((s) => (
              <div key={s.n} className="card p-5 flex gap-4">
                <span className="font-mono text-xs text-acid pt-1">{s.n}</span>
                <div>
                  <h2 className="font-display font-bold text-[17px]">{s.title}</h2>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-dim">{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stated plainly and early, because every competitor in this space
              implies they can get accounts deleted, and none of them can. */}
          <section className="mt-10 rounded-xl border border-line bg-panel/40 p-5">
            <div className="flex items-center gap-2 text-acid">
              <ShieldMark size={18} />
              <h2 className="font-display font-bold text-[15px] text-ink">{t("home.honestTitle")}</h2>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-dim">{t("home.honest")}</p>
          </section>

          <p className="mt-8 text-center">
            <Link href="/shield/guide" className="tap font-mono text-xs text-dim hover:text-acid transition-colors">
              {t("home.guide")} →
            </Link>
          </p>
        </div>
      </main>

      <Footer t={t} />
    </>
  );
}
