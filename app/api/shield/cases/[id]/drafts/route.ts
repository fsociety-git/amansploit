import { NextResponse } from "next/server";
import { db } from "@/lib/shield/supabase";
import { keyMatches } from "@/lib/shield/crypto";
import { buildDrafts } from "@/lib/shield/drafts";
import { rungsFor } from "@/lib/shield/ladder";

export const runtime = "nodejs";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { key } = (await req.json().catch(() => ({}))) as { key?: string };
  if (!key) return NextResponse.json({ error: "Missing key." }, { status: 401 });

  const supabase = db();
  const { data: c } = await supabase
    .from("cases")
    .select("id, manage_key_hash, platform, fake_handle, real_handle, display_name, severity, locale, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!c) return NextResponse.json({ error: "Case not found." }, { status: 404 });
  if (!keyMatches(key, c.manage_key_hash))
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });

  const locale = c.locale === "hi" ? "hi" : "en";
  return NextResponse.json({
    drafts: buildDrafts(c, locale),
    ladder: rungsFor(c.created_at),
  });
}
