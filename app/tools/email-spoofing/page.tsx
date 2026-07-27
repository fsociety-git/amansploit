import type { Metadata } from "next";
import { connection } from "next/server";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ToolShell from "@/components/tools/ToolShell";

export const metadata: Metadata = {
  title: "Can Someone Send Email As You? Free SPF/DKIM/DMARC Check | amansploit",
  description:
    "Check whether anyone can forge email from your domain. Free SPF, DKIM and DMARC lookup with a plain-English verdict and the exact records to fix it.",
  alternates: { canonical: "https://amansploit.com/tools/email-spoofing" },
};

export default async function Page() {
  await connection();
  return (
    <>
      <Nav />
      <ToolShell
        kicker="// FREE TOOL"
        title="Can someone send email as you?"
        intro="If your domain has no enforcing DMARC policy, anyone on the internet can send email that appears to come from your CEO — and receiving servers have been given no instruction to stop it. This checks in a few seconds."
        placeholder="yourcompany.com"
        endpoint="/api/tools/email"
        cta="Check my domain"
        variant="email"
      />
      <Footer />
    </>
  );
}
