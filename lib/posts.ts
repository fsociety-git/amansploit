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

export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface Post extends PostMeta {
  html: string;
  headings: Heading[];
}

/**
 * Pull the h2/h3 anchors back out of the rendered HTML.
 *
 * Parsed from the output rather than the markdown source because rehype-slug
 * generates the ids, and a table of contents that computes its own slugs will
 * drift from the ones actually on the page the first time a heading contains
 * punctuation. Reading the real ids means the links cannot be wrong.
 */
function extractHeadings(html: string): Heading[] {
  const out: Heading[] = [];
  const re = /<h([23])[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const text = m[3].replace(/<[^>]+>/g, "").trim();
    if (text) out.push({ id: m[2], text, level: Number(m[1]) as 2 | 3 });
  }
  return out;
}

/**
 * Posts sharing the most tags, newest first, excluding the current one.
 * Falls back to recency when nothing overlaps, so the slot is never empty.
 */
export async function getRelated(slug: string, limit = 3): Promise<PostMeta[]> {
  const all = await getPosts();
  const self = all.find((p) => p.slug === slug);
  if (!self) return all.slice(0, limit);
  const tags = new Set(self.tags.map((t) => t.toLowerCase()));
  return all
    .filter((p) => p.slug !== slug)
    .map((p) => ({ p, score: p.tags.filter((t) => tags.has(t.toLowerCase())).length }))
    .sort((a, b) => b.score - a.score || (a.p.date < b.p.date ? 1 : -1))
    .slice(0, limit)
    .map((x) => x.p);
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
  const html = await renderMarkdown(content);
  return { ...meta, html, headings: extractHeadings(html) };
}

export function formatDate(d: string): string {
  return new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
