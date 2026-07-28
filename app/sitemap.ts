import type { MetadataRoute } from "next";
import { CASES } from "@/lib/data";
import { getPosts } from "@/lib/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const posts = await getPosts();
  return [
    { url: "https://amansploit.com", lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: "https://amansploit.com/tools", lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: "https://amansploit.com/tools/email-spoofing", lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: "https://amansploit.com/tools/attack-surface", lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: "https://amansploit.com/tools/dns", lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: "https://amansploit.com/tools/tls", lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: "https://amansploit.com/tools/security-headers", lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: "https://amansploit.com/tools/jwt", lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "https://amansploit.com/tools/cvss", lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "https://amansploit.com/tools/hash", lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "https://amansploit.com/blog", lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: "https://amansploit.com/fix", lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: "https://amansploit.com/templates", lastModified: now, changeFrequency: "yearly" as const, priority: 0.7 },
    { url: "https://amansploit.com/templates/rules-of-engagement", lastModified: now, changeFrequency: "yearly" as const, priority: 0.7 },
    { url: "https://amansploit.com/templates/nda", lastModified: now, changeFrequency: "yearly" as const, priority: 0.7 },
    { url: "https://amansploit.com/transparency", lastModified: now, changeFrequency: "weekly" as const, priority: 0.5 },
    { url: "https://amansploit.com/data-handling", lastModified: now, changeFrequency: "yearly" as const, priority: 0.6 },
    ...posts.map((p) => ({
      url: `https://amansploit.com/blog/${p.slug}`,
      lastModified: new Date(p.date + "T00:00:00Z"),
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
    ...CASES.map((c) => ({
      url: `https://amansploit.com/work/${c.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
