import { db } from "@/lib/shield/supabase";
import { keyMatches } from "@/lib/shield/crypto";
import { buildEvidencePack } from "@/lib/shield/pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST rather than GET: the manage key stays in the body, so the download URL
 * that lands in the browser's history and the server's access log carries no
 * secret. The browser receives the bytes directly.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { key } = (await req.json().catch(() => ({}))) as { key?: string };
  if (!key) return new Response("Missing key.", { status: 401 });

  const supabase = db();
  const { data: c } = await supabase
    .from("cases")
    .select("id, manage_key_hash, platform, fake_handle, real_handle, display_name, severity, status, report_count, created_at, verified_at")
    .eq("id", id).maybeSingle();

  if (!c) return new Response("Case not found.", { status: 404 });
  if (!keyMatches(key, c.manage_key_hash)) return new Response("Not authorised.", { status: 401 });

  const { data: artifacts } = await supabase
    .from("artifacts").select("kind, sha256, bytes, capture_method, captured_at, storage_path, meta")
    .eq("case_id", id).order("captured_at");
  const { data: events } = await supabase
    .from("case_events").select("type, created_at").eq("case_id", id).order("created_at");

  // Pull the complainant's own screenshots back out for embedding. Capped so a
  // case with forty uploads cannot blow the function's memory or its timeout.
  const images: Array<{ bytes: Uint8Array; type: string; a: NonNullable<typeof artifacts>[number] }> = [];
  for (const a of (artifacts ?? []).filter((x) => x.kind === "victim_upload").slice(0, 8)) {
    const { data: blob } = await supabase.storage.from("evidence").download(a.storage_path);
    if (!blob) continue;
    images.push({
      bytes: new Uint8Array(await blob.arrayBuffer()),
      type: (a.meta as { contentType?: string })?.contentType ?? "image/png",
      a,
    });
  }

  const pdf = await buildEvidencePack(c, artifacts ?? [], events ?? [], images);

  return new Response(Buffer.from(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="shield-evidence-${id}.pdf"`,
      "cache-control": "no-store",
    },
  });
}
