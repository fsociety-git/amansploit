import { profileUrl } from "./handles";

export type VerifyOutcome =
  | { ok: true; method: "bio" }
  | { ok: false; reason: "not_found" | "unreachable" | "blocked" | "indeterminate" };

/**
 * Ownership check: does the public profile at `handle` currently display `code`?
 *
 * This is the single control that stops Shield being a brigading weapon. Anyone
 * can claim an account is impersonating them; only the real account holder can
 * put a code in that account's bio. So the case link stays dark until this
 * passes.
 *
 * On reliability, honestly: Instagram serves an HTML shell to logged-out
 * requests and rate-limits datacentre IPs aggressively, so this WILL fail in
 * production more often than it does in testing. That is why the failure modes
 * are distinguished. `blocked` and `unreachable` are not "you are lying" — they
 * are "we could not check", and the UI must say so, because telling a genuine
 * victim they failed a verification they actually passed is the worst outcome
 * this component can produce.
 *
 * The fallback path is deliberate: an unverified case still gets the full
 * evidence pack, complaint drafts and escalation guidance. Only the public
 * mobilisation link is gated. A victim is never blocked from the parts that help
 * them directly.
 */
export async function checkOwnership(
  platform: string,
  handle: string,
  code: string,
): Promise<VerifyOutcome> {
  const url = profileUrl(platform, handle);

  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        // A plain fetch with no UA is refused outright.
        "user-agent":
          "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36",
        "accept-language": "en-IN,en;q=0.9",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { ok: false, reason: "unreachable" };
  }

  if (res.status === 429 || res.status === 401 || res.status === 403) {
    return { ok: false, reason: "blocked" };
  }
  if (!res.ok) return { ok: false, reason: "unreachable" };

  const html = await res.text();

  // Bail out if we were served a login wall rather than a profile — otherwise a
  // "code not found" would be indistinguishable from a genuine failure.
  if (/loginForm|"login_required"|accounts\/login/i.test(html) && !/og:description/i.test(html)) {
    return { ok: false, reason: "blocked" };
  }

  // The bio appears in og:description and in the embedded JSON payload. Search
  // the whole document rather than parsing a specific shape, because the shape
  // changes without notice and a brittle selector fails silently.
  const needle = code.toUpperCase();
  const haystack = html.toUpperCase();
  return haystack.includes(needle) ? { ok: true, method: "bio" } : { ok: false, reason: "not_found" };
}
