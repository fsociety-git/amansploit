import type { MetadataRoute } from "next";
import { CASES } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: "https://amansploit.com", lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...CASES.map((c) => ({
      url: `https://amansploit.com/work/${c.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
