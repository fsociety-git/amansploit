/**
 * Single source of truth for the static security headers.
 *
 * `next.config.ts` serves these, and the self-scan section on the homepage
 * displays them. Importing the same array in both places is the point: if a
 * header is ever weakened, the page that boasts about the headers changes at
 * the same moment the header does. A hardcoded list in the marketing copy
 * would quietly keep claiming the old value.
 *
 * Content-Security-Policy is deliberately absent — it is minted per request in
 * `proxy.ts` because it carries a nonce, and the self-scan reads the real one
 * off the incoming request rather than repeating it here.
 */
export interface SecurityHeader {
  key: string;
  value: string;
  /** Why it is set, in one line, for the self-scan display. */
  why: string;
}

export const SECURITY_HEADERS: SecurityHeader[] = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
    why: "Browsers refuse plaintext HTTP to this domain for two years.",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
    why: "This site cannot be framed, so it cannot be clickjacked.",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
    why: "The browser does not second-guess declared content types.",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
    why: "Full URLs are not leaked to third parties.",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    why: "Browser features this site does not use are switched off.",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
    why: "Not a security control; kept for performance.",
  },
];

/** Shape `next.config.ts` wants — no `why` field. */
export const nextHeaderConfig = SECURITY_HEADERS.map(({ key, value }) => ({ key, value }));
