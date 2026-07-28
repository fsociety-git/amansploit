import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { PACKAGES, BOOKING_URL, LINKS } from "@/lib/data";
import { OFFERS, inr } from "@/lib/offers";

const URL = "https://amansploit.com/services/penetration-testing-india";
const DESCRIPTION =
  "Independent penetration testing from Pune, India — web applications, REST APIs and internal tooling. Fixed price agreed before work starts, retest included, report written by the person who did the testing.";

export const metadata: Metadata = {
  title: "Penetration Testing Services in India — Fixed Price, Retest Included | amansploit",
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: "Penetration testing services in India",
    description: DESCRIPTION,
    url: URL,
    siteName: "amansploit",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

/**
 * One service-and-location page, written properly, rather than a dozen
 * city-name variants.
 *
 * The templated approach — the same six paragraphs with "Pune" swapped for
 * "Mumbai", "Bengaluru", "Hyderabad" — is a doorway page. Google has explicitly
 * targeted that pattern for over a decade, it works less well every year, and
 * on a site whose entire argument is that it does not overstate things, a set of
 * near-identical pages claiming local presence in cities nobody works in would
 * be the most obviously dishonest thing on the domain.
 *
 * So: one page, genuinely about working with an Indian independent tester,
 * containing information that is actually different from the homepage —
 * currency, timezone, contracting, GST, what "remote" means in practice.
 */
export default async function Page() {
  await connection();

  return (
    <>
      <Nav />
      <main id="content" className="flex-1 bg-void">
        <div className="mx-auto max-w-3xl px-5 pt-32 pb-20">
          <div className="kicker">// SERVICES</div>
          <h1 className="mt-3 font-display font-bold text-4xl md:text-5xl tracking-tight">
            Penetration testing, from India.
          </h1>
          <p className="mt-4 text-lg text-dim leading-relaxed">
            I&apos;m a security analyst and independent penetration tester based in Pune,
            working with startups, MSSPs and product teams across India and remotely
            worldwide. Fixed price agreed before anything starts, a retest included rather
            than sold separately, and a report written by the person who did the testing.
          </p>

          <section className="mt-12">
            <h2 className="font-display font-bold text-2xl tracking-tight">What I test</h2>
            <div className="mt-4 space-y-4 text-[15px] text-dim leading-relaxed">
              <p>
                Web applications and REST APIs, which is where most real findings live —
                broken object level authorisation, session handling, business logic that can
                be driven out of order. Mobile applications against MASVS. Internal tooling
                and thick clients. Cloud configuration where it touches the application.
              </p>
              <p>
                What I test is manual work with automated coverage underneath, not a scan with
                a review pass. The distinction matters enough that{" "}
                <Link href="/blog/penetration-test-vs-vulnerability-scan" className="text-acid hover:underline">
                  I wrote a whole piece on how to tell them apart
                </Link>{" "}
                — including the cases where a scan is genuinely the right purchase and you
                should not pay me.
              </p>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display font-bold text-2xl tracking-tight">
              What it costs, in rupees
            </h2>
            <div className="mt-5 space-y-3">
              {PACKAGES.map((p) => (
                <div key={p.name} className="card-line rounded-xl p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="font-display font-bold text-lg">{p.name}</span>
                    <span className="font-mono text-sm">
                      <span className="text-acid font-bold">from {inr(p.from)}</span>
                      <span className="text-dim"> · {p.duration}</span>
                    </span>
                  </div>
                  <p className="mt-1.5 text-[14px] text-dim leading-relaxed">{p.best}</p>
                </div>
              ))}
              <div className="card-line rounded-xl p-5 border-acid/25">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="font-display font-bold text-lg">Smaller fixed-price work</span>
                  <span className="font-mono text-sm text-acid font-bold">
                    from {inr(OFFERS[1].price)}
                  </span>
                </div>
                <p className="mt-1.5 text-[14px] text-dim leading-relaxed">
                  DMARC rollout, security header hardening, external attack surface review —{" "}
                  <Link href="/fix" className="text-acid hover:underline">
                    scoped tightly enough to buy without a call
                  </Link>
                  .
                </p>
              </div>
            </div>
            <p className="mt-5 text-[14px] text-dim leading-relaxed">
              Prices are in rupees and quoted in rupees. Invoices are raised from India; if GST
              applies to your organisation it is added at the prevailing rate and shown
              separately rather than folded into the headline. International clients are
              invoiced in USD at a rate agreed at the point of quoting, so a currency move
              mid-engagement is my problem rather than yours.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="font-display font-bold text-2xl tracking-tight">
              What working remotely actually looks like
            </h2>
            <div className="mt-4 space-y-4 text-[15px] text-dim leading-relaxed">
              <p>
                I work IST, which overlaps comfortably with the Gulf, most of Europe in the
                afternoon, and the UK for the first half of the day. For US clients the
                practical arrangement is asynchronous, with a fixed call slot early in my
                evening — and it is worth saying plainly that if you need someone in your
                timezone for daily standups, that is a real requirement and I am not it.
              </p>
              <p>
                Testing is done from a fixed set of source addresses that you receive before
                the window opens, so your team can allowlist or attribute the traffic. You get
                a technical contact and an escalation number that is answered outside working
                hours, which matters more than it sounds when something looks like it might be
                an incident at 11pm.
              </p>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display font-bold text-2xl tracking-tight">
              Before you commission anything
            </h2>
            <div className="mt-4 space-y-4 text-[15px] text-dim leading-relaxed">
              <p>
                Read a report first. <Link href="/sample-penetration-test-report.pdf" className="text-acid hover:underline">Mine is published in full</Link> —
                a fictional target, real in every other respect. Any provider should be able to
                show you one, and it tells you more than a capability statement ever will.
              </p>
              <p>
                Run the <Link href="/tools" className="text-acid hover:underline">free checks</Link>.
                They take seconds, ask for nothing, and if they come back clean I will say so
                rather than finding something else to sell. And{" "}
                <Link href="/blog/how-to-prepare-for-your-first-penetration-test" className="text-acid hover:underline">
                  the preparation guide
                </Link>{" "}
                covers the decisions that need making before any engagement starts, whoever
                ends up doing it.
              </p>
            </div>
          </section>

          <div className="mt-14 pt-8 border-t border-line">
            <h2 className="font-display font-bold text-xl">Start a conversation</h2>
            <p className="mt-2 text-[15px] text-dim leading-relaxed">
              Tell me what you are working on and I will reply with an honest scope and a fixed
              quote — including telling you if you do not need a test.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`mailto:${LINKS.email}?subject=Penetration%20testing%20enquiry`}
                className="rounded-lg bg-acid text-void font-semibold px-5 py-2.5 text-sm hover:bg-acid/85 transition-colors"
              >
                Email me
              </a>
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-line px-5 py-2.5 text-sm text-dim hover:text-ink hover:border-dim transition-colors"
              >
                Book 15 minutes
              </a>
              <Link
                href="/#estimate"
                className="rounded-lg border border-line px-5 py-2.5 text-sm text-dim hover:text-ink hover:border-dim transition-colors"
              >
                Estimate my scope
              </Link>
            </div>
          </div>

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Service",
                serviceType: "Penetration testing",
                provider: { "@id": "https://amansploit.com/#person" },
                areaServed: [
                  { "@type": "Country", name: "India" },
                  { "@type": "Place", name: "Remote worldwide" },
                ],
                url: URL,
                description: DESCRIPTION,
                offers: PACKAGES.map((p) => ({
                  "@type": "Offer",
                  name: p.name,
                  price: p.from,
                  priceCurrency: "INR",
                  url: "https://amansploit.com/#packages",
                })),
              }),
            }}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
