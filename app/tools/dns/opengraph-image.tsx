import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
export const alt = "Free DNS hygiene checker — CAA, DNSSEC, dangling records";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default async function Image() {
  return ogCard({
    kicker: "free tool",
    title: "DNS hygiene",
    subtitle: "CAA, DNSSEC, nameserver resilience, wildcards and dangling records that enable subdomain takeover.",
    footer: "amansploit.com/tools",
  });
}
