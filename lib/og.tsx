import { ImageResponse } from "next/og";

/**
 * Shared Open Graph card.
 *
 * Every shareable page gets its own card with its own title. Before this,
 * every link — every blog post, every tool — rendered the same generic
 * "I BREAK THINGS" image on LinkedIn and Slack, which is the difference
 * between a link that looks like a specific useful thing and a link that
 * looks like an advert for a person.
 *
 * Constraints worth knowing if you edit this: it renders through Satori, not
 * a browser. Flexbox only, no grid, no external CSS, and any element with
 * more than one child needs an explicit `display: flex`. Fonts are Next's
 * bundled default — deliberately, so a missing font file can never fail a
 * production build.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const INK = "#e8eef4";
const DIM = "#8a99a8";
const ACID = "#2de0b3";
const VOID = "#070a0e";
const LINE = "#1c2733";

/** Long titles have to shrink or they overflow the card. */
function titleSize(title: string): number {
  if (title.length > 96) return 46;
  if (title.length > 68) return 54;
  if (title.length > 44) return 64;
  return 74;
}

/** Trim on a word boundary — a card ending mid-word looks broken, not truncated. */
function clamp(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s]+$/, "") + "…";
}

export function ogCard({
  kicker,
  title,
  subtitle,
  footer = "amansploit.com",
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  footer?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: VOID,
          backgroundImage: `radial-gradient(ellipse 70% 60% at 80% 30%, rgba(45,224,179,0.18), transparent 70%)`,
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* brand line */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 99,
              background: ACID,
              display: "flex",
            }}
          />
          <div style={{ display: "flex", color: ACID, fontSize: 23, letterSpacing: 4 }}>
            {kicker.toUpperCase()}
          </div>
        </div>

        {/* the actual subject of the page */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              color: INK,
              fontSize: titleSize(title),
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: -1.5,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                display: "flex",
                marginTop: 24,
                color: DIM,
                fontSize: 27,
                lineHeight: 1.35,
              }}
            >
              {clamp(subtitle, 150)}
            </div>
          ) : null}
        </div>

        {/* attribution */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${LINE}`,
            paddingTop: 26,
          }}
        >
          <div style={{ display: "flex", color: INK, fontSize: 24 }}>Aman Sonkamble</div>
          <div style={{ display: "flex", color: DIM, fontSize: 22 }}>{footer}</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
