import type { Metadata } from "next";
import { connection } from "next/server";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ToolShell from "@/components/tools/ToolShell";

export const metadata: Metadata = {
  title: "Free Security Headers Checker | amansploit",
  description:
    "Check any website's HTTP security headers — CSP, HSTS, X-Frame-Options and more — and get a grade with the exact fixes. Free, passive, no signup.",
  alternates: { canonical: "https://amansploit.com/tools/security-headers" },
};


export default async function Page() {
  await connection();
  return (
    <>
      <Nav />
      <ToolShell
        kicker="// FREE TOOL"
        title="Security headers checker"
        intro="HTTP response headers are the cheapest security controls you will ever deploy — and most sites are missing several. Enter a domain to see which, why each one matters, and exactly what to set."
        placeholder="example.com"
        endpoint="/api/tools/headers"
        cta="Check headers"
        variant="headers"
      />
      <Footer />
    </>
  );
}
