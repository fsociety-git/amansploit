import { Wordmark, Footer } from "@/components/shield/Brand";
import AdminPanel from "@/components/shield/AdminPanel";
import { getDict } from "@/lib/shield/i18n";

export const metadata = { robots: { index: false, follow: false } };

export default function ShieldAdmin() {
  const t = getDict("en");
  return (
    <>
      <header className="mx-auto max-w-lg px-5 pt-6"><Wordmark small /></header>
      <main className="flex-1">
        <div className="mx-auto max-w-lg px-5 pt-8 pb-16">
          <h1 className="font-display font-bold text-2xl">Review queue</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-dim">
            Cases where automated ownership checking could not complete, and cases that have
            been disputed.
          </p>
          <div className="mt-7"><AdminPanel /></div>
        </div>
      </main>
      <Footer t={t} />
    </>
  );
}
