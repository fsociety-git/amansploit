import type { MetadataRoute } from "next";

/**
 * Web app manifest — installability, a proper name and theme colour when the
 * site is added to a home screen or opened as a standalone window.
 *
 * Deliberately NOT paired with a service worker. Offline support would mean
 * caching pages, and two things on this site are actively wrong when cached:
 * the homepage self-scan claims to be running its checks at the moment you load
 * it, and the transparency page claims the same of its status checks. A cached
 * copy would keep making that claim while showing yesterday's answer, which
 * turns an honest feature into a false one. Every tool also needs the network
 * to do anything at all, so "works offline" would mean "shows you a shell that
 * cannot function".
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "amansploit — Aman Sonkamble",
    short_name: "amansploit",
    description:
      "Freelance penetration testing, security automation and secure development. Free security tools, a sample report, and writing on how to buy security work.",
    start_url: "/",
    display: "standalone",
    background_color: "#070a0e",
    theme_color: "#070a0e",
    orientation: "portrait-primary",
    categories: ["business", "productivity", "utilities"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcuts: [
      { name: "Free tools", url: "/tools", description: "Passive security checks" },
      { name: "Writing", url: "/blog", description: "Notes from the work" },
      { name: "Fixed-price fixes", url: "/fix", description: "Small things, fixed properly" },
    ],
  };
}
