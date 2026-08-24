import { Wordmark, Footer } from "@/components/shield/Brand";
import ManageDash from "@/components/shield/ManageDash";
import { getDict } from "@/lib/shield/i18n";
import { preferredLocale } from "@/lib/shield/net";

export const metadata = { robots: { index: false, follow: false } };

const SITE = "https://amansploit.com/shield";

export default async function Manage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = await preferredLocale();
  const t = getDict(locale);

  const s: Record<string, string> = {
    ...Object.fromEntries(
      ["title","checklist","c_evidence","c_verified","c_meta","c_friends","c_complaint","c_grievance",
       "shareTitle","shareD","keepSecret","ladder","drafts","day","dayN","openDraft",
       "copy","checkFirst","evidence","capture","capturing","captureBlocked","captureOk",
       "upload","uploading","uploadHint","artifacts_one","artifacts_other","story","storyHint",
       "download"].map((k) => [k, t(`manage.${k}`)]),
    ),
    vTitle: t("verify.title"), vSub: t("verify.sub"),
    reviewPrimary: t("verify.reviewPrimary"), reviewPrimaryD: t("verify.reviewPrimaryD"),
    autoTitle: t("verify.autoTitle"), autoD: t("verify.autoD"), codeLabel: t("verify.codeLabel"),
    how: t("verify.how"), check: t("verify.check"), checking: t("verify.checking"),
    failed: t("verify.failed"), indeterminate: t("verify.indeterminate"),
    requestReview: t("verify.requestReview"), reviewSent: t("verify.reviewSent"), manual: t("verify.manual"), manualD: t("verify.manualD"),
    whatsapp: t("case.whatsapp"), copied: t("common.copied"), loading: t("common.loading"),
  };

  return (
    <>
      <header className="mx-auto max-w-lg px-5 pt-6"><Wordmark small /></header>
      <main className="flex-1">
        <div className="mx-auto max-w-lg px-5 pt-8 pb-16">
          <ManageDash id={id} s={s} siteUrl={SITE} />
        </div>
      </main>
      <Footer t={t} />
    </>
  );
}
