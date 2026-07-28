import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Free passive security checks — no signup, nothing stored";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    kicker: "free tools",
    title: "Check a few things yourself.",
    subtitle:
      "Passive checks you can run on your own domain in seconds. No signup, no email wall, nothing stored.",
    footer: "amansploit.com/tools",
  });
}
