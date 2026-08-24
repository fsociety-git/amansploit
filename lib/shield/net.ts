import { headers } from "next/headers";

/**
 * Client IP behind Vercel's proxy. x-forwarded-for is a comma-separated chain
 * and the leftmost entry is the closest to the client, but it is also the part
 * a client can forge — so this is only ever used for rate limiting and dedup,
 * never for anything security-critical, and the value is HMAC'd before storage.
 */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "0.0.0.0";
}

export async function preferredLocale(): Promise<"en" | "hi"> {
  const h = await headers();
  const al = h.get("accept-language") ?? "";
  return /(^|,|\s)hi\b/i.test(al) ? "hi" : "en";
}
