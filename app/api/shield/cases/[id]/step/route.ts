import { NextResponse } from "next/server";
import { db } from "@/lib/shield/supabase";
import { keyMatches } from "@/lib/shield/crypto";

export const runtime = "nodejs";

/**
 * Records that the victim completed one of the steps only they can do — filing
 * the platform's own report, submitting the portal complaint, emailing the
 * grievance officer.
 *
 * Shield cannot observe any of these, so the checklist is self-reported. That is
 * honest as long as the labels say "I filed this" rather than implying Shield
 * verified it. A checklist that silently never completes is worse than none,
 * which is what the hardcoded version was.
 */
const STEPS = ["meta_form_filed", "complaint_filed", "grievance_sent", "fir_filed"] as const;

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { key, step, undo } = (await req.json().catch(() => ({}))) as
    { key?: string; step?: string; undo?: boolean };

  if (!key) return NextResponse.json({ error: "Missing key." }, { status: 401 });
  if (!STEPS.includes(step as (typeof STEPS)[number]))
    return NextResponse.json({ error: "Unknown step." }, { status: 400 });

  const supabase = db();
  const { data: c } = await supabase
    .from("cases").select("id, manage_key_hash").eq("id", id).maybeSingle();
  if (!c) return NextResponse.json({ error: "Case not found." }, { status: 404 });
  if (!keyMatches(key, c.manage_key_hash))
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });

  if (undo) {
    await supabase.from("case_events").delete().eq("case_id", id).eq("type", step);
  } else {
    const { count } = await supabase
      .from("case_events").select("id", { count: "exact", head: true })
      .eq("case_id", id).eq("type", step);
    // case_events is append-only by design, so guard against duplicates here
    // rather than letting the activity log fill with repeated taps.
    if ((count ?? 0) === 0) await supabase.from("case_events").insert({ case_id: id, type: step });
  }

  const { data: events } = await supabase
    .from("case_events").select("type, created_at").eq("case_id", id).order("created_at");
  return NextResponse.json({ ok: true, events: events ?? [] });
}
