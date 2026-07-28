import type { MetadataRoute } from "next";
import { CASES } from "@/lib/data";
import { getPosts } from "@/lib/posts";

/**
 * `lastmod` is omitted for pages whose modification date we do not actually
 * know.
 *
 * The previous version stamped `new Date()` on every static entry, which told
 * every crawler that all twenty-odd pages changed the moment the sitemap was
 * generated. Google's documented behaviour is to ignore lastmod entirely once
 * it decides a site's values are unreliable — so a blanket "everything changed
 * today" does not buy faster recrawls, it burns the one signal that would have.
 *
 * Posts carry a real date, so they keep theirs.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();
  return [
    { url: "https://amansploit.com", changeFrequency: "monthly" as const, priority: 1 },
    { url: "https://amansploit.com/tools", changeFrequency: "monthly" as const, priority: 0.9 },
    { url: "https://amansploit.com/tools/email-spoofing", changeFrequency: "monthly" as const, priority: 0.9 },
    { url: "https://amansploit.com/tools/attack-surface", changeFrequency: "monthly" as const, priority: 0.9 },
    { url: "https://amansploit.com/tools/dns", changeFrequency: "monthly" as const, priority: 0.9 },
    { url: "https://amansploit.com/tools/tls", changeFrequency: "monthly" as const, priority: 0.9 },
    { url: "https://amansploit.com/tools/security-headers", changeFrequency: "monthly" as const, priority: 0.9 },
    { url: "https://amansploit.com/tools/jwt", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "https://amansploit.com/tools/cvss", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "https://amansploit.com/tools/hash", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "https://amansploit.com/blog", changeFrequency: "weekly" as const, priority: 0.9 },
    { url: "https://amansploit.com/services/penetration-testing-india", changeFrequency: "monthly" as const, priority: 0.9 },
    { url: "https://amansploit.com/fix", changeFrequency: "monthly" as const, priority: 0.9 },
    { url: "https://amansploit.com/templates", changeFrequency: "yearly" as const, priority: 0.7 },
    { url: "https://amansploit.com/templates/rules-of-engagement", changeFrequency: "yearly" as const, priority: 0.7 },
    { url: "https://amansploit.com/templates/nda", changeFrequency: "yearly" as const, priority: 0.7 },
    { url: "https://amansploit.com/transparency", changeFrequency: "weekly" as const, priority: 0.5 },
    { url: "https://amansploit.com/data-handling", changeFrequency: "yearly" as const, priority: 0.6 },
    ...posts.map((p) => ({
      url: `https://amansploit.com/blog/${p.slug}`,
      lastModified: new Date((p.updated ?? p.date) + "T00:00:00Z"),
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
    ...CASES.map((c) => ({
      url: `https://amansploit.com/work/${c.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
