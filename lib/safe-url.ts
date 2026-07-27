import dns from "node:dns/promises";
import net from "node:net";

/**
 * SSRF protection for the public tools.
 *
 * These endpoints take a hostname from an anonymous visitor and make the server
 * talk to it. On a penetration tester's own site that is the first thing a
 * knowledgeable visitor will try to abuse, so the guard is layered:
 *
 *   1. scheme allowlist (http/https only — no file:, gopher:, ftp:)
 *   2. reject credentials in the URL and non-standard ports
 *   3. reject literal private/loopback/link-local addresses
 *   4. resolve A + AAAA and reject if ANY answer is in a blocked range
 *   5. redirects are never followed automatically; each hop is re-validated
 *   6. hard timeout and a response-size cap
 *
 * Residual risk, stated honestly: DNS rebinding between our resolution and the
 * connection is not fully closed, because Node's fetch will not let us pin the
 * socket to the address we validated. The blast radius is limited — these
 * endpoints return only headers and DNS records, never a response body — but it
 * is the reason there is nothing sensitive on this origin's private network.
 */

const BLOCKED_V4 = [
  [0, 8], // 0.0.0.0/8
  [10, 8], // private
  [127, 8], // loopback
  [169, 16, 254], // 169.254/16 link-local (incl. cloud metadata)
  [172, 12], // 172.16/12
  [192, 16, 168], // 192.168/16
  [100, 10], // 100.64/10 CGNAT
  [192, 24, 0], // 192.0.0/24
  [198, 15], // 198.18/15 benchmarking
];

function v4Blocked(ip: string): boolean {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => Number.isNaN(n))) return true;
  const [a, b] = p;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true; // link-local + 169.254.169.254 metadata
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a === 192 && b === 0) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a >= 224) return true; // multicast + reserved
  return false;
}

function v6Blocked(ip: string): boolean {
  const s = ip.toLowerCase();
  if (s === "::" || s === "::1") return true;
  if (s.startsWith("fe80")) return true; // link-local
  if (s.startsWith("fc") || s.startsWith("fd")) return true; // unique local
  if (s.startsWith("::ffff:")) return v4Blocked(s.replace("::ffff:", "")); // mapped v4
  return false;
}

export function ipBlocked(ip: string): boolean {
  if (net.isIPv4(ip)) return v4Blocked(ip);
  if (net.isIPv6(ip)) return v6Blocked(ip);
  return true;
}

export class UnsafeTargetError extends Error {}

/** Normalise arbitrary user input into a URL we are willing to touch. */
export function parseTarget(input: string): URL {
  const raw = input.trim();
  if (!raw) throw new UnsafeTargetError("Enter a domain.");
  if (raw.length > 253) throw new UnsafeTargetError("That domain is too long.");

  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    throw new UnsafeTargetError("That does not look like a valid domain.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:")
    throw new UnsafeTargetError("Only http and https are supported.");
  if (url.username || url.password)
    throw new UnsafeTargetError("Credentials in the URL are not allowed.");
  if (url.port && !["", "80", "443"].includes(url.port))
    throw new UnsafeTargetError("Only ports 80 and 443 are supported.");

  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host === "metadata.google.internal"
  )
    throw new UnsafeTargetError("That host is not reachable from here.");

  // literal IPs skip DNS, so check them directly
  if (net.isIP(host) && ipBlocked(host))
    throw new UnsafeTargetError("That address range is not allowed.");

  if (!net.isIP(host) && !host.includes("."))
    throw new UnsafeTargetError("Enter a full domain, like example.com.");

  return url;
}

/** Resolve and confirm every answer is a public address. */
export async function assertPublicHost(hostname: string): Promise<string[]> {
  if (net.isIP(hostname)) {
    if (ipBlocked(hostname)) throw new UnsafeTargetError("That address range is not allowed.");
    return [hostname];
  }

  const ips: string[] = [];
  const [v4, v6] = await Promise.allSettled([
    dns.resolve4(hostname),
    dns.resolve6(hostname),
  ]);
  if (v4.status === "fulfilled") ips.push(...v4.value);
  if (v6.status === "fulfilled") ips.push(...v6.value);

  if (ips.length === 0) throw new UnsafeTargetError("That domain does not resolve.");
  for (const ip of ips) {
    if (ipBlocked(ip))
      throw new UnsafeTargetError("That domain resolves to a private address.");
  }
  return ips;
}

export interface SafeResponse {
  finalUrl: string;
  status: number;
  headers: Record<string, string>;
  hops: number;
}

/**
 * Fetch a target with redirects handled manually so every hop is re-validated.
 * Only headers are read — the body is never consumed or returned.
 */
export async function safeFetchHeaders(
  target: URL,
  { maxHops = 3, timeoutMs = 8000 } = {},
): Promise<SafeResponse> {
  let url = target;
  let hops = 0;

  for (;;) {
    await assertPublicHost(url.hostname);

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    let res: Response;
    try {
      res = await fetch(url.toString(), {
        method: "GET",
        redirect: "manual",
        signal: ctrl.signal,
        headers: {
          "user-agent": "amansploit-tools/1.0 (+https://amansploit.com/tools)",
          accept: "text/html,*/*;q=0.5",
        },
        cache: "no-store",
      });
    } catch {
      throw new UnsafeTargetError("Could not reach that host.");
    } finally {
      clearTimeout(timer);
    }

    // never read the body — we only care about headers
    try {
      await res.body?.cancel();
    } catch {
      /* already closed */
    }

    const loc = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && loc && hops < maxHops) {
      hops++;
      let next: URL;
      try {
        next = new URL(loc, url);
      } catch {
        throw new UnsafeTargetError("That host sent an invalid redirect.");
      }
      url = parseTarget(next.toString()); // re-run the full guard on the new hop
      continue;
    }

    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => (headers[k.toLowerCase()] = v));
    return { finalUrl: url.toString(), status: res.status, headers, hops };
  }
}

/** Crude per-instance rate limit. Serverless means per-instance, not global. */
const hits = new Map<string, number[]>();
export function rateLimit(key: string, max = 12, windowMs = 60_000): boolean {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) hits.clear(); // crude memory bound
  return arr.length <= max;
}
