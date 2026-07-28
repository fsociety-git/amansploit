import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
export const alt = "JWT decoder";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default async function Image() {
  return ogCard({ kicker: "free tool", title: "JWT decoder", subtitle: "Decode a JSON Web Token and see what it actually claims. Runs in your browser — the token is never sent anywhere.", footer: "amansploit.com/tools" });
}
