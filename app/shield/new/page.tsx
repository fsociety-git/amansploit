import { Wordmark, Footer } from "@/components/shield/Brand";
import Wizard from "@/components/shield/Wizard";
import { getDict } from "@/lib/shield/i18n";
import { preferredLocale } from "@/lib/shield/net";

export const metadata = { robots: { index: false } };

export default async function NewCase() {
  const locale = await preferredLocale();
  const t = getDict(locale);

  // Strings are resolved on the server and handed to the client component, so
  // no dictionary and no i18n runtime is shipped to the phone.
  const keys = [
    "step","q1","q1help","q1placeholder","platform","q2","q2help","q2placeholder",
    "nameLabel","namePlaceholder","q3","q4","q4help","consent","submit","creating",
    "sev_existing","sev_existing_d","sev_posting_photos","sev_posting_photos_d",
    "sev_messaging_contacts","sev_messaging_contacts_d","sev_asking_money","sev_asking_money_d",
    "sev_intimate","sev_intimate_d",
  ];
  const s: Record<string, string> = Object.fromEntries(keys.map((k) => [k, t(`wizard.${k}`)]));
  s.continue = t("common.continue");
  s.back = t("common.back");
  s.optional = t("common.optional");
  // Interstitial copy, flattened into the same bag the wizard already receives.
  for (const k of ["title","sub","adult","adultD","minor","minorD","money","moneyD","keep","keepD","notFault","back"])
    s[k] = t(`ncii.${k}`);
  s.fraudTitle = t("fraud.title"); s.fraudSub = t("fraud.sub");
  s.call = t("fraud.call"); s.callD = t("fraud.callD");
  s.portal = t("fraud.portal"); s.portalD = t("fraud.portalD");
  s.warn = t("fraud.warn"); s.warnD = t("fraud.warnD");
  s.continueBtn = t("fraud.continue");

  return (
    <>
      <header className="mx-auto max-w-lg px-5 pt-6"><Wordmark small /></header>
      <main className="flex-1">
        <div className="mx-auto max-w-lg px-5 pt-8 pb-16">
          <Wizard s={s} locale={locale} />
        </div>
      </main>
      <Footer t={t} />
    </>
  );
}
