import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Wordmark, Footer, ShieldMark } from "@/components/shield/Brand";
import ReportFlow from "@/components/shield/ReportFlow";
import { db } from "@/lib/shield/supabase";
import { getDict, isLocale, DEFAULT_LOCALE } from "@/lib/shield/i18n";
import { profileUrl } from "@/lib/shield/handles";

export const dynamic = "force-dynamic";

const SITE = "https://amansploit.com/shield";

async function loadCase(id: string) {
  // Explicit column list. `select("*")` here would put manage_key_hash,
  // verification_code and the encrypted contact into a server component's props
  // and therefore into the RSC payload sent to every stranger who opens the link.
  const { data } = await db()
    .from("cases")
    .select("id, platform, fake_handle, real_handle, display_name, severity, status, locale, report_count, verified_at, created_at")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = await loadCase(id);
  if (!c) return { title: "Case not found — Shield" };
  // The victim's name and photo never go in the card. A link forwarded through
  // WhatsApp renders its preview in every group it lands in.
  return {
    title: "Fake account alert — help report it",
    description: "Someone is being impersonated. Reporting the fake account takes about 30 seconds.",
    robots: { index: false, follow: false },
    openGraph: {
      title: "⚠ Fake account alert — help report it",
      description: "Takes about 30 seconds. No signup needed.",
      url: `${SITE}/c/${id}`,
      type: "website",
    },
  };
}

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await loadCase(id);
  if (!c) notFound();

  const locale = isLocale(c.locale) ? c.locale : DEFAULT_LOCALE;
  const t = getDict(locale);

  // A case that has not passed the ownership check is not publishable. This is
  // the entire abuse model: without it, anyone could point a crowd at any
  // account by asserting it was fake.
  if (c.status !== "live") {
    return (
      <>
        <header className="mx-auto max-w-lg px-5 pt-6"><Wordmark small /></header>
        <main className="flex-1">
          <div className="mx-auto max-w-lg px-5 pt-16 pb-10 text-center">
            <div className="inline-flex text-dim"><ShieldMark size={40} /></div>
            <h1 className="mt-5 font-display font-bold text-2xl">{t("case.pending")}</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-dim">{t("case.pendingD")}</p>
          </div>
        </main>
        <Footer t={t} />
      </>
    );
  }

  const s: Record<string, string> = Object.fromEntries(
    ["cta","ctaSub","s1","s2","s3","s4","done","doneThanks","already","counter_one","counter_other",
     "counterZero","share","whatsapp","shareMsg","copyLink"].map((k) => [k, t(`case.${k}`)]),
  );
  s.copied = t("common.copied");

  const fakeUrl = profileUrl(c.platform, c.fake_handle);

  return (
    <>
      <header className="mx-auto max-w-lg px-5 pt-6"><Wordmark small /></header>

      <main className="flex-1">
        <div className="mx-auto max-w-lg px-5 pt-8 pb-10">
          <div className="rounded-xl border border-[#ff6b6b]/45 bg-[#ff6b6b]/[0.07] px-5 py-5">
            <p className="font-display font-bold text-xl text-[#ff8a8a]">{t("case.alert")}</p>
            <p className="mt-2 font-mono text-[15px] text-ink break-all">@{c.fake_handle}</p>
            <p className="mt-3 text-[15px] text-dim">
              {t("case.impersonating", { name: c.display_name })}
            </p>
          </div>

          {c.real_handle && (
            <div className="mt-3 rounded-xl border border-acid/30 bg-acid/[0.05] px-5 py-4">
              <div className="flex items-center gap-2 text-acid">
                <ShieldMark size={16} />
                <span className="font-mono text-[11px] uppercase tracking-wider">{t("case.verified")}</span>
              </div>
              <p className="mt-2 text-[14px] text-dim">{t("case.realIs")}</p>
              <p className="font-mono text-[15px] text-ink break-all">@{c.real_handle}</p>
              <p className="mt-2 text-[13px] leading-snug text-dim">
                {t("case.verifiedD", { name: c.display_name })}
              </p>
            </div>
          )}

          <h1 className="sr-only">{t("case.alert")} — @{c.fake_handle}</h1>

          <ReportFlow
            id={c.id} s={s} profileUrl={fakeUrl} initialCount={c.report_count}
            displayName={c.display_name} shareUrl={`${SITE}/c/${c.id}`}
          />

          {/* Transparency and the objection route, on the same page as the call
              to action rather than hidden in a footer. */}
          <div className="mt-12 border-t border-line pt-6">
            <p className="text-[13px] leading-relaxed text-dim">
              {t("case.disclosure", { name: c.display_name, handle: `@${c.real_handle ?? "—"}` })}
            </p>
            <a href={`/shield/shield/c/${c.id}/dispute`} className="tap mt-2 font-mono text-[11px] text-dim hover:text-acid">
              {t("case.dispute")} →
            </a>
          </div>
        </div>
      </main>

      <Footer t={t} />
    </>
  );
}
