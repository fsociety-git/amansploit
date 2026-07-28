import type { Metadata } from "next";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { KeyboardHelp, ScrollProgress, SkipLink, ToastHost } from "@/components/Chrome";
import { LINKS } from "@/lib/data";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/700.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://amansploit.com"),
  title: "Aman Sonkamble — Security Engineer & Full-Stack Developer",
  description:
    "Freelance offensive security and engineering. Web & API penetration testing, SIEM & security automation, secure full-stack builds, and AI/ML tooling — delivered with report-grade rigor.",
  keywords: [
    "penetration testing",
    "VAPT",
    "web application security",
    "security automation",
    "SIEM",
    "dark web monitoring",
    "full-stack developer",
    "AI security",
    "freelance security engineer",
  ],
  // Inherited by any page that does not set its own. That is correct for the
  // homepage and a silent de-indexing bug for anything else, because a page
  // canonicalised to "/" is telling Google to drop it in favour of the
  // homepage. Every other route sets its own; a new one must too.
  alternates: { canonical: "https://amansploit.com" },
  twitter: { card: "summary_large_image" },
  /**
   * Search Console / Bing Webmaster verification, read from the environment so
   * proving ownership is a Vercel setting rather than a code change and a
   * deploy. Set GOOGLE_SITE_VERIFICATION (or BING_SITE_VERIFICATION) to the
   * token from the "HTML tag" method and the meta tag appears; leave it unset
   * and nothing is emitted. DNS TXT verification works too and needs neither.
   */
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
  openGraph: {
    title: "Aman Sonkamble — Security Engineer & Full-Stack Developer",
    description:
      "I break things to build them safer. Pentesting, security automation, secure full-stack development, and AI tooling for clients who want it done right.",
    url: "https://amansploit.com",
    siteName: "amansploit",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // The CSP in proxy.ts is `script-src 'self' 'nonce-…'` with no 'unsafe-inline'
  // — which is the whole reason this site grades A+. Any inline script we add
  // ourselves therefore needs that same nonce, or the browser refuses to run it.
  // proxy.ts puts it on the request headers precisely so a Server Component can
  // read it back here.
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {/* Restore the motion preference before first paint, so a user who has
            turned motion off never sees a frame of the thing they turned off. */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html:
              'try{var m=localStorage.getItem("motion");if(m)document.documentElement.dataset.motion=m;}catch(e){}',
          }}
        />
        <SkipLink />
        <ScrollProgress />
        <ToastHost>
          {children}
          <KeyboardHelp />
        </ToastHost>
        <Analytics />
        <script
          type="application/ld+json"
          // Structured data: tells search engines who this is and what is sold.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Person",
                  "@id": "https://amansploit.com/#person",
                  name: "Aman Sonkamble",
                  jobTitle: "Security Engineer & Full-Stack Developer",
                  email: `mailto:${LINKS.email}`,
                  url: "https://amansploit.com",
                  sameAs: [LINKS.linkedin, "https://github.com/fsociety-git"],
                  address: { "@type": "PostalAddress", addressLocality: "Pune", addressCountry: "IN" },
                  knowsAbout: [
                    "Penetration Testing", "Web Application Security", "SIEM",
                    "Security Automation", "Threat Intelligence", "Cloud Security",
                    "Machine Learning",
                  ],
                },
                {
                  "@type": "ProfessionalService",
                  "@id": "https://amansploit.com/#service",
                  name: "amansploit — security engineering & development",
                  provider: { "@id": "https://amansploit.com/#person" },
                  areaServed: "Worldwide",
                  serviceType: [
                    "Web & API Penetration Testing",
                    "Security Automation & SIEM Tooling",
                    "Secure Full-Stack Development",
                    "AI/ML Engineering",
                  ],
                },
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
