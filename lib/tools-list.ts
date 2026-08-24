/**
 * The catalogue of free tools, in one place.
 *
 * It lives in lib/ rather than in the page that renders it because two other
 * things need it: the AI-search index at /llms.txt, and anything else that has
 * to describe the site without importing a React page module (which would drag
 * Nav, Footer and the whole client bundle into a plain-text route handler).
 */
export const TOOLS_LIST = [
  {
    href: "/shield",
    name: "Someone is impersonating you",
    desc: "Emergency response for a fake Instagram or WhatsApp account in your name. Mobilises your contacts to report it, preserves the evidence with hashes and timestamps, and drafts your cybercrime complaint and grievance escalation. Free, no signup, works in English and Hindi.",
    tag: "impersonation \u00b7 India \u00b7 free",
  },
  {
    href: "/tools/email-spoofing",
    name: "Can someone send email as you?",
    desc: "Checks SPF, DKIM and DMARC and tells you, in plain English, whether anyone can forge mail from your domain. Most companies fail this.",
    tag: "SPF · DKIM · DMARC",
  },
  {
    href: "/tools/attack-surface",
    name: "What the internet can see",
    desc: "Finds every subdomain ever issued a certificate from public transparency logs, checks which still resolve, and flags the ones whose names suggest admin panels or forgotten staging environments.",
    tag: "subdomains \u00b7 attack surface",
  },
  {
    href: "/tools/dns",
    name: "DNS hygiene",
    desc: "CAA, DNSSEC, nameserver resilience, wildcard records, and dangling CNAMEs pointing at services that no longer exist \u2014 the precondition for subdomain takeover.",
    tag: "CAA \u00b7 DNSSEC \u00b7 takeover",
  },
  {
    href: "/tools/tls",
    name: "TLS configuration",
    desc: "Which protocol versions and ciphers your server still negotiates, whether the certificate chain validates, and how long before it expires. A padlock says none of this.",
    tag: "TLS \u00b7 ciphers \u00b7 certificates",
  },
  {
    href: "/tools/security-headers",
    name: "Security headers checker",
    desc: "Grades your HTTP response headers — CSP, HSTS, frame protection and more — and gives you the exact values to set.",
    tag: "CSP · HSTS · headers",
  },
  {
    href: "/tools/jwt",
    name: "JWT decoder",
    desc: "Read a JSON Web Token's claims with the expiry as a real date, and the usual mistakes flagged \u2014 alg:none, no expiry, lifetimes measured in months. Runs in your browser; the token never leaves the page.",
    tag: "JWT \u00b7 in-browser",
  },
  {
    href: "/tools/cvss",
    name: "CVSS 3.1 calculator",
    desc: "Base score and vector string, implemented against the specification including the round-up rule most calculators get wrong \u2014 with an honest note on where CVSS stops helping.",
    tag: "CVSS \u00b7 scoring",
  },
  {
    href: "/tools/hash",
    name: "Hash identifier",
    desc: "What format is this hash? Where several share a shape, all are listed rather than guessing \u2014 a confident wrong answer costs hours.",
    tag: "hashes \u00b7 in-browser",
  },
];
