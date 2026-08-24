import { NextResponse } from "next/server";
import { db } from "@/lib/shield/supabase";
import { keyMatches, sha256 } from "@/lib/shield/crypto";
import { captureProfile } from "@/lib/shield/capture";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_UPLOAD = 8 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];

async function authorise(id: string, key: string | null) {
  if (!key) return null;
  const supabase = db();
  const { data } = await supabase
    .from("cases").select("id, manage_key_hash, platform, fake_handle").eq("id", id).maybeSingle();
  if (!data || !keyMatches(key, data.manage_key_hash)) return null;
  return { supabase, c: data };
}

/** Triggers a server-side capture of the fake profile. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { key } = (await req.json().catch(() => ({}))) as { key?: string };
  const auth = await authorise(id, key ?? null);
  if (!auth) return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  const { supabase, c } = auth;

  const result = await captureProfile(c.platform, c.fake_handle);

  if (!result.ok) {
    await supabase.from("case_events").insert({
      case_id: id, type: "capture_failed", detail: { reason: result.reason },
    });
    // Deliberately not an error to the user. A blocked capture is expected and
    // their own screenshots are the better evidence anyway.
    return NextResponse.json({ ok: false, reason: result.reason });
  }

  for (const a of result.artifacts) {
    const path = `${id}/${a.kind}-${Date.now()}.${a.kind === "html" ? "html" : "json"}`;
    const { error } = await supabase.storage.from("evidence").upload(path, a.bytes, {
      contentType: a.contentType, upsert: false,
    });
    if (error) continue;
    await supabase.from("artifacts").insert({
      case_id: id, kind: a.kind, storage_path: path, sha256: a.sha256,
      bytes: a.bytes.length, capture_method: "server_headless", meta: a.meta,
    });
  }

  await supabase.from("case_events").insert({
    case_id: id, type: "evidence_captured", detail: { source: "server", count: result.artifacts.length },
  });

  return NextResponse.json({ ok: true, extracted: result.extracted });
}

/** Victim-uploaded screenshots — the primary visual record. */
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Malformed upload." }, { status: 400 });

  const auth = await authorise(id, String(form.get("key") ?? "") || null);
  if (!auth) return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  const { supabase } = auth;

  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file supplied." }, { status: 400 });
  if (file.size > MAX_UPLOAD)
    return NextResponse.json({ error: "That image is larger than 8MB." }, { status: 413 });
  if (!ALLOWED.includes(file.type))
    return NextResponse.json({ error: "Only PNG, JPEG or WebP images." }, { status: 415 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const digest = sha256(bytes);
  const ext = file.type.split("/")[1]!.replace("jpeg", "jpg");
  const path = `${id}/upload-${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from("evidence").upload(path, bytes, {
    contentType: file.type, upsert: false,
  });
  if (error) return NextResponse.json({ error: "Could not store the file." }, { status: 500 });

  await supabase.from("artifacts").insert({
    case_id: id, kind: "victim_upload", storage_path: path, sha256: digest,
    bytes: bytes.length, capture_method: "victim_upload",
    meta: { originalName: file.name, contentType: file.type },
  });
  await supabase.from("case_events").insert({
    case_id: id, type: "evidence_captured", detail: { source: "upload" },
  });

  return NextResponse.json({ ok: true, sha256: digest, bytes: bytes.length });
}
