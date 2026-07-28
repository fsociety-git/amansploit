import tls from "node:tls";
import { NextRequest, NextResponse } from "next/server";
import { UnsafeTargetError, assertPublicHost, rateLimit } from "@/lib/safe-url";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * TLS configuration check.
 *
 * Opens a TLS handshake on 443 and reads back what the server agreed to, then
 * repeats the handshake pinned to each protocol version to find out what else
 * it is still willing to speak. Nothing is sent after the handshake — no HTTP
 * request is made at all, so this cannot log in, cannot trigger application
 * behaviour, and appears in the target's logs as a connection that opened and
 * closed.
 *
 * SSRF guard: the hostname is resolved and every returned address is checked
 * against private, loopback, link-local, CGNAT and metadata ranges before we
 * connect — the same `assertPublicHost` the header tool uses. Port is fixed at
 * 443 and not user-controllable, which removes the usual "scan my internal
 * network via your server" trick.
 *
 * Honesty rules, consistent with the other tools:
 *  · A failed handshake at a given version means "not offered OR not testable
 *    from here". Node's OpenSSL build refuses TLS 1.0/1.1 at its default
 *    security level, so a refusal is genuinely ambiguous and is reported as
 *    such rather than as a pass.
 *  · A connection failure is inconclusive, not a finding.
 */

const PORT = 443;
const VERSIONS = ["TLSv1", "TLSv1.1", "TLSv1.2", "TLSv1.3"] as const;
type Version = (typeof VERSIONS)[number];

/** Ciphers OpenSSL considers weak but will still negotiate if asked. */
const WEAK_CIPHER = /(RC4|DES|3DES|MD5|NULL|EXPORT|anon|CBC3)/i;

function cleanHost(input: string): string {
  let d = input.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
  if (!d || d.length > 253 || !d.includes(".") || /[^a-z0-9.\-]/.test(d))
    throw new UnsafeTargetError("Enter a hostname like example.com.");
  return d;
}

interface Handshake {
  ok: boolean;
  protocol?: string;
  cipher?: { name: string; standardName?: string };
  cert?: tls.PeerCertificate;
  authorized?: boolean;
  authorizationError?: string;
  error?: string;
}

function handshake(host: string, opts: tls.ConnectionOptions = {}): Promise<Handshake> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (r: Handshake) => {
      if (settled) return;
      settled = true;
      try {
        socket.destroy();
      } catch {
        /* already gone */
      }
      resolve(r);
    };

    const socket = tls.connect({
      host,
      port: PORT,
      servername: host, // SNI — without it many hosts serve the wrong certificate
      rejectUnauthorized: false, // we want to *report* trust failures, not throw on them
      timeout: 8000,
      ...opts,
    });

    socket.once("secureConnect", () => {
      const cipher = socket.getCipher();
      done({
        ok: true,
        protocol: socket.getProtocol() ?? undefined,
        cipher: cipher ? { name: cipher.name, standardName: cipher.standardName } : undefined,
        cert: socket.getPeerCertificate(true),
        authorized: socket.authorized,
        authorizationError: socket.authorized ? undefined : String(socket.authorizationError ?? ""),
      });
    });
    socket.once("timeout", () => done({ ok: false, error: "timeout" }));
    socket.once("error", (e: NodeJS.ErrnoException) => done({ ok: false, error: e.code ?? e.message }));
  });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anon";
  if (!rateLimit(`tls:${ip}`, 6))
    return NextResponse.json({ error: "Too many checks. Try again in a minute." }, { status: 429 });

  let body: { target?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const host = cleanHost(String(body.target ?? ""));
    await assertPublicHost(host); // throws UnsafeTargetError on private/loopback/metadata

    const primary = await handshake(host);
    if (!primary.ok) {
      return NextResponse.json({
        host,
        inconclusive: true,
        headline: `Could not complete a TLS handshake with ${host} on port 443 (${primary.error}). That may mean it doesn't serve HTTPS, or that something in between refused the connection — either way it isn't a finding about the configuration.`,
      });
    }

    // What else will it speak? Each version needs its own handshake.
    const versions = await Promise.all(
      VERSIONS.map(async (v: Version) => {
        const r = await handshake(host, { minVersion: v, maxVersion: v });
        return {
          version: v,
          offered: r.ok,
          cipher: r.cipher?.name,
          // A local refusal is not the same as the server declining.
          untestable: !r.ok && (r.error === "ERR_SSL_UNSUPPORTED_PROTOCOL" || r.error === "ERR_TLS_INVALID_PROTOCOL_VERSION"),
        };
      }),
    );

    const cert = primary.cert;
    const validTo = cert?.valid_to ? new Date(cert.valid_to) : null;
    const daysLeft = validTo ? Math.floor((validTo.getTime() - Date.now()) / 86_400_000) : null;

    const legacy = versions.filter((v) => v.offered && (v.version === "TLSv1" || v.version === "TLSv1.1"));
    const has13 = versions.some((v) => v.offered && v.version === "TLSv1.3");
    const weakCipher = versions.some((v) => v.cipher && WEAK_CIPHER.test(v.cipher));

    const issues: string[] = [];
    if (legacy.length)
      issues.push(
        `${legacy.map((l) => l.version).join(" and ")} still negotiable. Both are deprecated and disabled in current browsers; leaving them enabled only serves attackers downgrading a connection.`,
      );
    if (!has13)
      issues.push(
        "TLS 1.3 is not offered. It is faster and removes whole classes of downgrade and renegotiation problem — worth enabling before anything else here.",
      );
    if (weakCipher) issues.push("A weak cipher suite was negotiated during version probing.");
    if (primary.authorized === false)
      issues.push(
        `The certificate chain did not validate: ${primary.authorizationError}. Browsers will warn on this.`,
      );
    if (daysLeft !== null && daysLeft < 0) issues.push("The certificate has expired.");
    else if (daysLeft !== null && daysLeft < 21)
      issues.push(`The certificate expires in ${daysLeft} days. Check the renewal is automated.`);

    const grade = primary.authorized === false || (daysLeft ?? 1) < 0
      ? "F"
      : legacy.length || weakCipher
        ? "C"
        : !has13
          ? "B"
          : "A";

    return NextResponse.json({
      host,
      grade,
      headline:
        issues.length === 0
          ? `${host} negotiated ${primary.protocol} with ${primary.cipher?.name}, the certificate chain validates, and nothing legacy is on offer. Nothing to fix here.`
          : `${host} negotiated ${primary.protocol}, but ${issues.length} thing${issues.length > 1 ? "s are" : " is"} worth changing.`,
      negotiated: { protocol: primary.protocol, cipher: primary.cipher?.name },
      versions,
      issues,
      certificate: cert
        ? {
            subject: cert.subject?.CN ?? null,
            issuer: cert.issuer?.O ?? cert.issuer?.CN ?? null,
            validFrom: cert.valid_from ?? null,
            validTo: cert.valid_to ?? null,
            daysLeft,
            altNames: String(cert.subjectaltname ?? "")
              .split(",")
              .map((s) => s.trim().replace(/^DNS:/, ""))
              .filter(Boolean)
              .slice(0, 25),
            trusted: primary.authorized === true,
          }
        : null,
    });
  } catch (e) {
    if (e instanceof UnsafeTargetError)
      return NextResponse.json({ error: e.message }, { status: 400 });
    return NextResponse.json({ error: "Could not complete that check." }, { status: 500 });
  }
}
