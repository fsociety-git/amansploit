import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Faq, Section, ToolSchema, type QA } from "@/components/tools/ToolContent";

/**
 * Shell for the browser-only utilities. Deliberately separate from ToolShell:
 * there is no target field, no API call and no result state to manage, and
 * pretending otherwise would drag in a form these pages don't have.
 */
export default function UtilityPage({
  kicker, title, intro, url, name, description, faq, tool, children,
}: {
  kicker: string; title: string; intro: string;
  url: string; name: string; description: string;
  faq: QA[]; tool: React.ReactNode; children?: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main id="content" className="flex-1 bg-void">
        <div className="mx-auto max-w-3xl px-5 pt-32 pb-20">
          <Link href="/tools" className="inline-block py-1.5 font-mono text-xs text-dim hover:text-acid transition-colors">
            ← all tools
          </Link>
          <div className="kicker mt-8">{kicker}</div>
          <h1 className="mt-3 font-display font-bold text-4xl md:text-5xl tracking-tight">{title}</h1>
          <p className="mt-4 text-lg text-dim leading-relaxed">{intro}</p>
          <div className="mt-8">{tool}</div>
          {children}
          <Faq items={faq} />
        </div>
      </main>
      <ToolSchema name={name} url={url} description={description} faq={faq} />
      <Footer />
    </>
  );
}
export { Section };
