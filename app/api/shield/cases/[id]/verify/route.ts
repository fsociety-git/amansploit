import { NextResponse } from "next/server";
import { db } from "@/lib/shield/supabase";
import { keyMatches } from "@/lib/shield/crypto";
import { checkOwnership } from "@/lib/shield/verify";

export const runtime = "nodejs";

const MAX_ATTEMPTS = 20;

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { key } = (await req.json().catch(() => ({}))) as { key?: string };
  if (!key) return NextResponse.json({ error: "Missing manage key." }, { status: 401 });

  const supabase = db();
  const { data: row } = await supabase
    .from("cases")
    .select("id, manage_key_hash, platform, real_handle, verification_code, status, verify_attempts")
    .eq("id", id)
    .maybeSingle();

  if (!row) return NextResponse.json({ error: "Case not found." }, { status: 404 });
  if (!keyMatches(key, row.manage_key_hash))
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  if (row.status === "live")
    return NextResponse.json({ ok: true, alreadyVerified: true });
  if (!row.real_handle)
    return NextResponse.json({ error: "No real handle on this case to verify." }, { status: 400 });

  // Cap attempts so the endpoint cannot be used to hammer Instagram from our IP,
  // which would get the whole service rate-limited for every other victim.
  if (row.verify_attempts >= MAX_ATTEMPTS)
    return NextResponse.json(
      { ok: false, reason: "blocked", error: "Too many verification attempts. Please contact us." },
      { status: 429 },
    );

  await supabase.from("cases").update({ verify_attempts: row.verify_attempts + 1 }).eq("id", id);

  const outcome = await checkOwnership(row.platform, row.real_handle, row.verification_code);

  if (!outcome.ok) {
    await supabase.from("case_events").insert({
      case_id: id, type: "verify_failed", detail: { reason: outcome.reason },
    });
    // "not_found" means we looked and it wasn't there. "blocked"/"unreachable"
    // mean we could not look at all — a distinction the UI must preserve rather
    // than collapsing both into "verification failed".
    return NextResponse.json({ ok: false, reason: outcome.reason });
  }

  await supabase
    .from("cases")
    .update({ status: "live", verified_at: new Date().toISOString(), verification_method: outcome.method })
    .eq("id", id);
  await supabase.from("case_events").insert({ case_id: id, type: "verified", detail: { method: outcome.method } });

  return NextResponse.json({ ok: true });
}
