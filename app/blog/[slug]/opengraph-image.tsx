import { getPost } from "@/lib/posts";
import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "amansploit — writing";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Next 16: `params` arrives as a Promise and must be awaited. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  return ogCard({
    kicker: "writing",
    title: post?.title ?? "Notes from the work",
    subtitle: post?.description,
    footer: "amansploit.com/blog",
  });
}
