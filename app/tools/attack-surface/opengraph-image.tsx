import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Free subdomain and attack surface discovery from certificate transparency logs";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    kicker: "free tool",
    title: "What the internet can see",
    subtitle:
      "Every subdomain ever issued a certificate, and which of them still resolve. Passive, public records only.",
    footer: "amansploit.com/tools",
  });
}
