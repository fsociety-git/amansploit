import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Free HTTP security headers checker with a grade and exact fixes";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return ogCard({
    kicker: "free tool",
    title: "Security headers checker",
    subtitle:
      "Grades CSP, HSTS, frame protection and more — and gives you the exact header values to set. Free, passive, no signup.",
    footer: "amansploit.com/tools",
  });
}
