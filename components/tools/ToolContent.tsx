/**
 * Shared furniture for the tool pages: prose sections, an FAQ, and the
 * structured data that goes with them.
 *
 * These are Server Components — plain markup, no client JS. They exist because
 * a page that is only an input box gives a search engine about forty words to
 * work with, and gives a visitor who arrived with a question ("what does
 * p=none actually mean?") nothing at all. The answer to both problems is the
 * same: write down what you know.
 */

export function Section({
  h,
  children,
}: {
  h: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <h2 className="font-display font-bold text-2xl tracking-tight">{h}</h2>
      <div className="mt-4 space-y-4 text-[15px] text-dim leading-relaxed">{children}</div>
    </section>
  );
}

export interface QA {
  q: string;
  a: string;
}

export function Faq({ items }: { items: QA[] }) {
  return (
    <section className="mt-12">
      <h2 className="font-display font-bold text-2xl tracking-tight">Common questions</h2>
      <dl className="mt-6 space-y-6">
        {items.map((x) => (
          <div key={x.q} className="border-l-2 border-acid/40 pl-5">
            <dt className="font-display font-bold text-[17px] leading-snug text-ink">{x.q}</dt>
            <dd className="mt-2 text-[15px] text-dim leading-relaxed">{x.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/**
 * Structured data for a tool page.
 *
 * Honest note on the FAQPage block: Google restricted FAQ rich results to
 * government and health sites, so this will almost certainly not produce the
 * expandable questions in search results. It is included because it still helps
 * a crawler understand what the page is, and it costs a few hundred bytes — not
 * because it is going to win a rich snippet. Do not let anyone tell you
 * otherwise.
 */
export function ToolSchema({
  name,
  url,
  description,
  faq,
}: {
  name: string;
  url: string;
  description: string;
  faq: QA[];
}) {
  const graph = [
    {
      "@type": "WebApplication",
      name,
      url,
      description,
      applicationCategory: "SecurityApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: { "@id": "https://amansploit.com/#person" },
      publisher: { "@id": "https://amansploit.com/#person" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://amansploit.com" },
        { "@type": "ListItem", position: 2, name: "Free tools", item: "https://amansploit.com/tools" },
        { "@type": "ListItem", position: 3, name, item: url },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faq.map((x) => ({
        "@type": "Question",
        name: x.q,
        acceptedAnswer: { "@type": "Answer", text: x.a },
      })),
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}
