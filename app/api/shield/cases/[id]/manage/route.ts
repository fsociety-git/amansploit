import { NextResponse } from "next/server";
import { db } from "@/lib/shield/supabase";
import { keyMatches } from "@/lib/shield/crypto";

export const runtime = "nodejs";

/**
 * The victim's view of their own case.
 *
 * POST rather than GET, with the key in the body: a key in a query string ends
 * up in server access logs, browser history and any Referer header the page
 * emits. The client holds it in the URL fragment, which never leaves the browser.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { key } = (await req.json().catch(() => ({}))) as { key?: string };
  if (!key) return NextResponse.json({ error: "Missing key." }, { status: 401 });

  const supabase = db();
  const { data: c } = await supabase
    .from("cases")
    .select("id, manage_key_hash, platform, fake_handle, real_handle, display_name, severity, status, locale, report_count, verification_code, verified_at, created_at, delete_after")
    .eq("id", id)
    .maybeSingle();

  if (!c) return NextResponse.json({ error: "Case not found." }, { status: 404 });
  if (!keyMatches(key, c.manage_key_hash))
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });

  const { data: events } = await supabase
    .from("case_events").select("type, created_at").eq("case_id", id).order("created_at");

  const { count: artifactCount } = await supabase
    .from("artifacts").select("id", { count: "exact", head: true }).eq("case_id", id);

  const { manage_key_hash: _drop, ...safe } = c;
  return NextResponse.json({ case: safe, events: events ?? [], artifactCount: artifactCount ?? 0 });
}
