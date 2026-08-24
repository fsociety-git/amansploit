import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { db } from "@/lib/shield/supabase";

export const runtime = "nodejs";

const SITE = "https://amansploit.com/shield";

/**
 * A 1080x1920 image for an Instagram story.
 *
 * Public — no manage key. It contains nothing the case page does not already
 * show, and requiring a secret would mean the victim could not simply long-press
 * and save it from their phone, which is the entire point.
 *
 * The QR code is the payload: a story viewer cannot tap a link, so the case URL
 * has to be scannable. High error correction, because it will be photographed
 * off a screen at an angle.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const { data: c } = await db()
    .from("cases").select("id, fake_handle, display_name, status").eq("id", id).maybeSingle();
  if (!c || c.status !== "live") return new Response("Not available.", { status: 404 });

  const url = `${SITE}/c/${c.id}`;
  const qr = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "H", margin: 1, width: 460,
    color: { dark: "#070a0e", light: "#ffffff" },
  });

  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", background: "#070a0e",
        padding: 90, fontFamily: "sans-serif",
      }}>
        <div style={{ display: "flex", fontSize: 34, letterSpacing: 10, color: "#2de0b3", marginBottom: 40 }}>
          SHIELD
        </div>
        <div style={{
          display: "flex", fontSize: 88, fontWeight: 700, color: "#e8eef4",
          textAlign: "center", lineHeight: 1.12, marginBottom: 34,
        }}>
          This account is fake
        </div>
        <div style={{
          display: "flex", fontSize: 60, color: "#ff8a8a", fontFamily: "monospace", marginBottom: 60,
        }}>
          @{c.fake_handle}
        </div>
        <img src={qr} width={460} height={460} style={{ borderRadius: 28 }} />
        <div style={{
          display: "flex", fontSize: 42, color: "#8a99a8", textAlign: "center",
          marginTop: 54, lineHeight: 1.35,
        }}>
          Scan to report it — 30 seconds
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#4a5964", marginTop: 70, letterSpacing: 3 }}>
          amansploit.com
        </div>
      </div>
    ),
    { width: 1080, height: 1920 },
  );
}
