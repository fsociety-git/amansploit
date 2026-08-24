import { NextResponse } from "next/server";
import { db } from "@/lib/shield/supabase";

export const runtime = "nodejs";

/**
 * Operator view. Guarded by ADMIN_SECRET compared in constant time — a plain
 * `!==` on a secret leaks its length and prefix to a patient attacker, and this
 * endpoint can publish a case that mobilises strangers.
 */
function authorised(key: string | null): boolean {
  const expected = process.env.SHIELD_ADMIN_SECRET;
  if (!expected || !key || key.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < key.length; i++) diff |= key.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export async function POST(req: Request) {
  const { key, action, id, reason } = (await req.json().catch(() => ({}))) as
    { key?: string; action?: string; id?: string; reason?: string };

  if (!authorised(key ?? null))
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });

  const supabase = db();

  if (action === "list") {
    const { data } = await supabase
      .from("cases")
      .select("id, platform, fake_handle, real_handle, display_name, severity, status, created_at, dispute_count, report_count")
      .in("status", ["pending_review", "disputed"])
      .order("created_at", { ascending: false })
      .limit(100);
    return NextResponse.json({ cases: data ?? [] });
  }

  if (!id) return NextResponse.json({ error: "Missing case id." }, { status: 400 });

  if (action === "approve") {
    await supabase.from("cases").update({
      status: "live", verified_at: new Date().toISOString(), verification_method: "manual",
    }).eq("id", id);
    await supabase.from("case_events").insert({
      case_id: id, type: "verified", detail: { method: "manual" },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "reject") {
    await supabase.from("cases").update({ status: "removed" }).eq("id", id);
    await supabase.from("case_events").insert({
      case_id: id, type: "rejected", detail: { reason: String(reason ?? "").slice(0, 500) },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
