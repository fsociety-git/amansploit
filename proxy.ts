import { NextRequest, NextResponse } from "next/server";

/**
 * Per-request nonce + Content-Security-Policy.
 *
 * Next 16 renamed `middleware` → `proxy`. This runs before the page renders,
 * mints a fresh nonce, and puts it on the CSP header; Next then attaches that
 * nonce to its own framework/bundle script tags automatically.
 *
 * Why: a CSP with `script-src 'unsafe-inline'` is what caps a Security Headers
 * scan at A. Nonce + 'strict-dynamic' removes it and gets A+.
 *
 * Note on style-src: React and Framer Motion emit real `style="…"` attributes
 * on first paint, so 'unsafe-inline' has to stay for styles. That is a far
 * smaller risk than inline *scripts* and is not what scanners penalise.
 * (CSSOM writes like `el.style.opacity = …` are unaffected by CSP either way.)
 *
 * The CSP lives here rather than in next.config.ts — two CSP headers would be
 * intersected by the browser and break the page.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self' data:;
    connect-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      // everything except static assets and prefetches, which need no CSP
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
