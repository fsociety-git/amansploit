import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
export const alt = "Hash identifier";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default async function Image() {
  return ogCard({ kicker: "free tool", title: "Hash identifier", subtitle: "What format is this hash? Lists every possibility where the shape is ambiguous, rather than guessing one.", footer: "amansploit.com/tools" });
}
