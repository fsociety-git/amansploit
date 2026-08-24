import { notFound } from "next/navigation";
import { Wordmark, Footer } from "@/components/shield/Brand";
import DisputeForm from "@/components/shield/DisputeForm";
import { db } from "@/lib/shield/supabase";
import { getDict, isLocale, DEFAULT_LOCALE } from "@/lib/shield/i18n";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function Dispute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Only the fake handle is surfaced here — the objector needs to know which
  // case they are challenging, and nothing else about the person who filed it.
  const { data: c } = await db()
    .from("cases").select("id, fake_handle, locale, status").eq("id", id).maybeSingle();
  if (!c) notFound();

  const t = getDict(isLocale(c.locale) ? c.locale : DEFAULT_LOCALE);
  const s = Object.fromEntries(
    ["title","sub","reason","reasonHelp","contact","submit","sending","done","doneD","suspended"]
      .map((k) => [k, t(`dispute.${k}`)]),
  ) as Record<string, string>;

  return (
    <>
      <header className="mx-auto max-w-lg px-5 pt-6"><Wordmark small /></header>
      <main className="flex-1">
        <div className="mx-auto max-w-lg px-5 pt-8 pb-16">
          <h1 className="font-display font-bold text-2xl">{s.title}</h1>
          <p className="mt-1 font-mono text-[12px] text-dim">
            #{c.id} · @{c.fake_handle}
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-dim">{s.sub}</p>
          <div className="mt-7"><DisputeForm id={c.id} s={s} /></div>
        </div>
      </main>
      <Footer t={t} />
    </>
  );
}
