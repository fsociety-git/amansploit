import { NextResponse } from "next/server";
import { db } from "@/lib/shield/supabase";
import { keyMatches } from "@/lib/shield/crypto";

export const runtime = "nodejs";

/**
 * The human door in the ownership gate.
 *
 * A victim whose platform will not serve its own profile to a server is not a
 * liar, and must not be treated as one. They ask for review; a person checks and
 * decides. The safety property holds — nothing goes live unreviewed — but it no
 * longer depends on Meta's disclosure policy staying still.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { key, note } = (await req.json().catch(() => ({}))) as { key?: string; note?: string };
  if (!key) return NextResponse.json({ error: "Missing key." }, { status: 401 });

  const supabase = db();
  const { data: c } = await supabase
    .from("cases").select("id, manage_key_hash, status").eq("id", id).maybeSingle();
  if (!c) return NextResponse.json({ error: "Case not found." }, { status: 404 });
  if (!keyMatches(key, c.manage_key_hash))
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  if (c.status === "live") return NextResponse.json({ ok: true, already: true });

  await supabase.from("cases").update({ status: "pending_review" }).eq("id", id);
  await supabase.from("case_events").insert({
    case_id: id, type: "review_requested",
    detail: { note: String(note ?? "").slice(0, 500) },
  });

  return NextResponse.json({ ok: true });
}
