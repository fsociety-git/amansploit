import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Free SPF, DKIM and DMARC checker — can someone send email as you?";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    kicker: "free tool",
    title: "Can someone send email as you?",
    subtitle:
      "Checks SPF, DKIM and DMARC and tells you in plain English whether your domain can be forged. No signup, nothing stored.",
    footer: "amansploit.com/tools",
  });
}
