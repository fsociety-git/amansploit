import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
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
  alternates: { canonical: "https://amansploit.com" },
  twitter: { card: "summary_large_image" },
  openGraph: {
    title: "Aman Sonkamble — Security Engineer & Full-Stack Developer",
    description:
      "I break things to build them safer. Pentesting, security automation, secure full-stack development, and AI tooling for clients who want it done right.",
    url: "https://amansploit.com",
    siteName: "amansploit",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
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
