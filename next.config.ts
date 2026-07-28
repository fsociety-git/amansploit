import type { NextConfig } from "next";
import { nextHeaderConfig } from "./lib/security-headers";

// NOTE: Content-Security-Policy is set per-request in proxy.ts (nonce-based).
// Do not add it here as well — the browser intersects duplicate CSP headers.
//
// The list itself lives in lib/security-headers.ts so that the self-scan
// section on the homepage renders from the same array that is actually served.
// One place to change, and the claim cannot drift from the configuration.

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: nextHeaderConfig }];
  },
};

export default nextConfig;
