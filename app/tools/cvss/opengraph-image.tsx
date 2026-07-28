import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
export const alt = "CVSS 3.1 calculator";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default async function Image() {
  return ogCard({ kicker: "free tool", title: "CVSS 3.1 calculator", subtitle: "Base score and vector string, implemented against the spec — including the round-up rule most calculators get wrong.", footer: "amansploit.com/tools" });
}
