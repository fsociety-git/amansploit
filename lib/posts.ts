import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";

/**
 * Markdown-file blog. Posts are plain `.md` in content/posts — write one, drop
 * it in, and the index, sitemap and RSS feed pick it up. No CMS, no database,
 * nothing to keep patched.
 *
 * Frontmatter:
 *   title, description, date (YYYY-MM-DD), tags: [a, b], draft: true|false
 *   generated: true   — written by scripts/generate-post.mjs on a schedule.
 *                       The post page renders a disclosure note when this is set.
 */

const DIR = path.join(process.cwd(), "content", "posts");

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  readingMinutes: number;
  draft: boolean;
  /** Drafted by the scheduled generator rather than typed by hand. Disclosed on the page. */
  generated: boolean;
}

export interface Post extends PostMeta {
  html: string;
}

function readingTime(md: string): number {
  const words = md.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

async function files(): Promise<string[]> {
  try {
    return (await fs.readdir(DIR)).filter((f) => f.endsWith(".md"));
  } catch {
    return []; // no posts yet — the blog renders an empty state rather than failing
  }
}

function toMeta(file: string, raw: string): PostMeta {
  const { data, content } = matter(raw);
  return {
    slug: file.replace(/\.md$/, ""),
    title: String(data.title ?? file),
    description: String(data.description ?? ""),
    date: String(data.date ?? "1970-01-01"),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readingMinutes: readingTime(content),
    draft: Boolean(data.draft),
    generated: Boolean(data.generated),
  };
}

/** Published posts, newest first. Drafts are excluded in production. */
export async function getPosts(): Promise<PostMeta[]> {
  const out: PostMeta[] = [];
  for (const f of await files()) {
    const raw = await fs.readFile(path.join(DIR, f), "utf8");
    const meta = toMeta(f, raw);
    if (meta.draft && process.env.NODE_ENV === "production") continue;
    out.push(meta);
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Shared markdown → HTML pipeline. Used by posts and by the changelog. */
export async function renderMarkdown(md: string): Promise<string> {
  return String(
    await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeSlug)
      .use(rehypeHighlight, { detect: true })
      .use(rehypeStringify)
      .process(md),
  );
}

export async function getPost(slug: string): Promise<Post | null> {
  // guard against traversal — slug comes from the URL
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  let raw: string;
  try {
    raw = await fs.readFile(path.join(DIR, `${slug}.md`), "utf8");
  } catch {
    return null;
  }
  const meta = toMeta(`${slug}.md`, raw);
  if (meta.draft && process.env.NODE_ENV === "production") return null;

  const { content } = matter(raw);
  return { ...meta, html: await renderMarkdown(content) };
}

export function formatDate(d: string): string {
  return new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
