/**
 * Micro-offers.
 *
 * Separate from PACKAGES in data.ts because they are a different product
 * class, not a cheaper tier of the same thing. A package is an assessment —
 * open-ended discovery, priced by the days it takes. These are closed-scope
 * remediation: a known problem, a known fix, a fixed price, no call required
 * before buying.
 *
 * They exist because the pricing ladder started at ₹45,000, which is a large
 * first purchase from someone who found this site ten minutes ago via a free
 * tool. Somebody has to be able to buy a small thing first.
 *
 * Every one of these is scoped so it can honestly be delivered in the stated
 * time. If that stops being true, change the price or the scope — not the
 * promise.
 */

export interface Offer {
  slug: string;
  name: string;
  price: number;
  usd: number;
  turnaround: string;
  /** One line: what problem this solves, in the buyer's words. */
  hook: string;
  includes: string[];
  /** Said plainly, because scope honesty is the product. */
  notIncluded: string;
}

export const OFFERS: Offer[] = [
  {
    slug: "email-spoofing",
    name: "Stop your domain being spoofed",
    price: 12000,
    usd: 140,
    turnaround: "records live in 48 hours, enforcement in ~4 weeks",
    hook: "Anyone can currently send email that appears to come from your domain.",
    includes: [
      "SPF, DKIM and DMARC published correctly for every legitimate sender you have",
      "Reporting switched on, so you can see who is sending as you",
      "Two weeks of report triage — I read them, you don't",
      "A go/no-go call on moving to enforcement, with the evidence behind it",
      "The final move to p=reject once nothing legitimate is failing",
    ],
    notIncluded:
      "Migrating your mail platform, or fixing a sender that refuses to support DKIM — I will tell you if we hit one.",
  },
  {
    slug: "security-headers",
    name: "Security headers, done properly",
    price: 6000,
    usd: 70,
    turnaround: "1–2 days",
    hook: "The cheapest controls you will ever deploy, and most sites are missing several.",
    includes: [
      "Every response header set correctly for your stack, not copy-pasted",
      "A Content-Security-Policy deployed in report-only first, so nothing breaks",
      "Violation reports reviewed with you before enforcement",
      "Verified A or A+ on securityheaders.com, or you don't pay",
      "A short written note on what each header does, for whoever inherits it",
    ],
    notIncluded:
      "Rewriting inline scripts your CMS or analytics injects. If that's what blocks a strict CSP, I'll say so on day one rather than at the end.",
  },
  {
    slug: "attack-surface",
    name: "What the internet can see",
    price: 15000,
    usd: 175,
    turnaround: "2 days",
    hook: "Most breaches start on something nobody remembered was exposed.",
    includes: [
      "Every subdomain I can find, including ones from certificate transparency logs",
      "What is actually listening on each, and what it identifies itself as",
      "Forgotten admin panels, staging environments and default pages",
      "Expired or expiring certificates, and hosts that were meant to be decommissioned",
      "A prioritised written summary — what to turn off, what to look at, what is fine",
    ],
    notIncluded:
      "Exploitation. This is reconnaissance only, entirely passive and non-intrusive. If it finds something worth testing properly, that is a separate conversation.",
  },
];

export const offerBySlug = (slug: string) => OFFERS.find((o) => o.slug === slug);

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
