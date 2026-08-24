import { sha256 } from "./crypto";
import { profileUrl } from "./handles";

export type Captured = {
  kind: "html" | "metadata";
  bytes: Buffer;
  sha256: string;
  contentType: string;
  meta: Record<string, unknown>;
};

export type CaptureResult =
  | { ok: true; artifacts: Captured[]; extracted: Record<string, unknown> }
  | { ok: false; reason: "login_wall" | "blocked" | "unreachable" | "not_found" };

/**
 * Server-side capture of a public profile, and an honest account of its limits.
 *
 * A screenshot taken by our server is worse evidence than one taken by the
 * victim, and that is not a temporary engineering problem. Instagram serves a
 * login wall to logged-out requests from datacentre ranges and rate-limits them
 * hard. A headless browser pointed at a profile from a cloud host will usually
 * photograph a login page.
 *
 * A login-page screenshot inside a document headed "evidence" is worse than no
 * screenshot: it looks like proof, it is filed with the police, and it shows
 * nothing. So this function REFUSES to store a capture it can detect as a login
 * wall, rather than storing it and letting the PDF imply otherwise. The victim's
 * own screenshots, taken on their logged-in phone, are the primary visual record
 * and always work.
 *
 * What the server can reliably contribute is the part a phone screenshot cannot:
 * the raw HTML as served at a known instant, hashed at capture time, plus the
 * metadata extracted from it. That is what makes the pack verifiable later.
 */
export async function captureProfile(platform: string, handle: string): Promise<CaptureResult> {
  const url = profileUrl(platform, handle);

  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36",
        "accept-language": "en-IN,en;q=0.9",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return { ok: false, reason: "unreachable" };
  }

  if (res.status === 404) return { ok: false, reason: "not_found" };
  if (res.status === 429 || res.status === 401 || res.status === 403)
    return { ok: false, reason: "blocked" };
  if (!res.ok) return { ok: false, reason: "unreachable" };

  const html = await res.text();
  const capturedAt = new Date().toISOString();

  const looksLikeLoginWall =
    /accounts\/login|loginForm|"login_required"/i.test(html) && !/og:description/i.test(html);
  if (looksLikeLoginWall) return { ok: false, reason: "login_wall" };

  const pick = (re: RegExp) => html.match(re)?.[1]?.trim();
  const desc = pick(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)/i);
  const title = pick(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i);
  const image = pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i);

  // og:description on a profile reads like "12 Followers, 30 Following, 4 Posts…"
  const counts = desc?.match(/([\d,.KMkm]+)\s+Followers[,\s]+([\d,.KMkm]+)\s+Following[,\s]+([\d,.KMkm]+)\s+Posts/i);

  const extracted = {
    url,
    handle,
    platform,
    capturedAt,
    httpStatus: res.status,
    title: title ?? null,
    description: desc ?? null,
    profileImageUrl: image ?? null,
    followers: counts?.[1] ?? null,
    following: counts?.[2] ?? null,
    posts: counts?.[3] ?? null,
  };

  // Instagram now serves a 600KB client-rendered shell to servers, with no og:
  // tags at all — a 200 response carrying no profile data. Filing a metadata
  // artifact where every field is null puts an empty "profile data" table in an
  // evidence pack, which reads as a capture that failed rather than one that was
  // withheld. The HTML is still worth keeping: it is what the URL served at a
  // known instant, hashed, and it evidences that the account existed and
  // responded. The empty derivative is not.
  const gotAnything = Boolean(title || desc || image || counts);

  const htmlBuf = Buffer.from(html, "utf8");
  const metaBuf = Buffer.from(JSON.stringify(extracted, null, 2), "utf8");

  return {
    ok: true,
    extracted,
    artifacts: [
      {
        kind: "html",
        bytes: htmlBuf,
        // Hashed here, before anything is written anywhere. The hash attests to
        // what was received, not to whatever ends up in the bucket.
        sha256: sha256(htmlBuf),
        contentType: "text/html",
        meta: { url, capturedAt, httpStatus: res.status, bytes: htmlBuf.length },
      },
      ...(gotAnything
        ? [{
            kind: "metadata" as const,
            bytes: metaBuf,
            sha256: sha256(metaBuf),
            contentType: "application/json",
            meta: extracted,
          }]
        : []),
    ],
  };
}
