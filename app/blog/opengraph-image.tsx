import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Writing on penetration testing, email security and detection engineering";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    kicker: "writing",
    title: "Notes from the work.",
    subtitle:
      "How to buy a penetration test, why your domain is probably spoofable, and how the tooling actually works.",
    footer: "amansploit.com/blog",
  });
}
