import type { Metadata } from "next";
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
