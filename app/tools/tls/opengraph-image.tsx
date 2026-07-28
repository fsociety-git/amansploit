import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
export const alt = "Free TLS and SSL configuration checker";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default async function Image() {
  return ogCard({
    kicker: "free tool",
    title: "TLS configuration checker",
    subtitle: "Which protocol versions and ciphers your server still accepts, and whether the certificate validates. Handshake only — no request sent.",
    footer: "amansploit.com/tools",
  });
}
