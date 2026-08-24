import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Case pages name a real person and circulate by link. They already send
      // noindex headers; this stops them being crawled at all.
      disallow: ["/shield/c/", "/api/"],
    },
    sitemap: "https://amansploit.com/sitemap.xml",
  };
}
