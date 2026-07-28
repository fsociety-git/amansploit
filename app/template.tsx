"use client";

import { usePathname } from "next/navigation";

/**
 * A very short fade between routes.
 *
 * Two constraints shaped this. It animates opacity and nothing else, because
 * `transform`, `filter` and `will-change` on an ancestor create a containing
 * block for `position: fixed` descendants — which would silently break the
 * fixed WebGL canvas and the sticky choreography in Act I. Opacity does not.
 *
 * And it is disabled on the homepage entirely: that route already runs its own
 * scroll-driven sequence from the first frame, and fading it in competes with
 * the thing it is meant to introduce.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path === "/") return <>{children}</>;
  return <div className="route-fade">{children}</div>;
}
