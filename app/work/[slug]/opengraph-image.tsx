import { CASES } from "@/lib/data";
import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "amansploit — case study";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Next 16: `params` arrives as a Promise and must be awaited. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = CASES.find((x) => x.slug === slug);

  return ogCard({
    kicker: c?.kicker ?? "case study",
    title: c?.title ?? "Selected work",
    subtitle: c?.problem,
    footer: "amansploit.com/work",
  });
}
