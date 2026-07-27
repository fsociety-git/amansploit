import { ImageResponse } from "next/og";

export const alt = "Aman Sonkamble — Security Engineer & Full-Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Share card for LinkedIn / WhatsApp / X. Generated at build time.
 * Next 16: params and id arrive as Promises (unused here, but noted).
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#070a0e",
          backgroundImage:
            "radial-gradient(ellipse 70% 60% at 78% 40%, rgba(45,224,179,0.20), transparent 70%)",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: "#2de0b3",
            fontSize: 26,
            letterSpacing: 4,
          }}
        >
          <div
            style={{
              width: 13,
              height: 13,
              borderRadius: 99,
              background: "#2de0b3",
              display: "flex",
            }}
          />
          AMANSPLOIT
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 34,
            fontSize: 82,
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: -2,
          }}
        >
          <div style={{ color: "#e8eef4", display: "flex" }}>I BREAK THINGS</div>
          <div style={{ color: "#2de0b3", display: "flex" }}>TO BUILD THEM SAFER.</div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 34,
            color: "#8a99a8",
            fontSize: 30,
            lineHeight: 1.35,
          }}
        >
          Aman Sonkamble — penetration testing, security automation,
        </div>
        <div style={{ display: "flex", color: "#8a99a8", fontSize: 30 }}>
          secure full-stack development, applied AI/ML.
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 44,
            fontSize: 21,
            color: "#8a99a8",
          }}
        >
          {["CEH Master", "Security+", "CND", "Top 1% TryHackMe"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                border: "1px solid #1c2733",
                borderRadius: 99,
                padding: "9px 20px",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
