import { createHash, createHmac, randomBytes, createCipheriv, createDecipheriv } from "node:crypto";

export const sha256 = (input: string | Buffer): string =>
  createHash("sha256").update(input).digest("hex");

/**
 * IP addresses are never stored. They are HMAC'd with a server-side secret so
 * the value supports "has this device already reported?" without retaining a
 * personal identifier — for a tool whose users are, by definition, already being
 * targeted by someone. A plain hash would be trivially reversible by iterating
 * the IPv4 space; the keyed HMAC is not.
 */
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT;
  if (!salt) throw new Error("IP_HASH_SALT is not set");
  return createHmac("sha256", salt).update(ip).digest("hex");
}

/** URL-safe secret for the manage key and the verification code. */
export const secret = (bytes = 24): string => randomBytes(bytes).toString("base64url");

/**
 * Contact details (a WhatsApp number or email) are encrypted at rest with
 * AES-256-GCM. They are the only directly identifying data Shield holds, and
 * they exist solely so the victim can be told their case is about to expire.
 */
export function encryptContact(plain: string): string {
  const key = Buffer.from(process.env.CONTACT_ENC_KEY ?? "", "base64");
  if (key.length !== 32) throw new Error("CONTACT_ENC_KEY must be 32 bytes, base64-encoded");
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return [iv.toString("base64url"), c.getAuthTag().toString("base64url"), enc.toString("base64url")].join(".");
}

export function decryptContact(payload: string): string | null {
  try {
    const key = Buffer.from(process.env.CONTACT_ENC_KEY ?? "", "base64");
    const [iv, tag, data] = payload.split(".");
    const d = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
    d.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([d.update(Buffer.from(data, "base64url")), d.final()]).toString("utf8");
  } catch {
    return null;
  }
}

/** Constant-time-ish comparison for the manage key. */
export function keyMatches(rawKey: string, storedHash: string): boolean {
  const a = sha256(rawKey);
  if (a.length !== storedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ storedHash.charCodeAt(i);
  return diff === 0;
}
