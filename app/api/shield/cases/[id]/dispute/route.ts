import { NextResponse } from "next/server";
import { db } from "@/lib/shield/supabase";
import { hashIp } from "@/lib/shield/crypto";
import { clientIp } from "@/lib/shield/net";

export const runtime = "nodejs";

/**
 * The counterweight. Anyone accused by a case needs a route to object that does
 * not require knowing or contacting the person who created it. Three disputes
 * pull the case offline pending review — the accused should not have to wait on
 * a human when the tool is actively mobilising strangers against them.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { reason, contact } = (await req.json().catch(() => ({}))) as { reason?: string; contact?: string };

  const text = String(reason ?? "").trim().slice(0, 2000);
  if (text.length < 10)
    return NextResponse.json({ error: "Please tell us briefly why this case is wrong." }, { status: 400 });

  const supabase = db();
  const { data: c } = await supabase.from("cases").select("id, dispute_count, status").eq("id", id).maybeSingle();
  if (!c) return NextResponse.json({ error: "Case not found." }, { status: 404 });

  await supabase.from("disputes").insert({
    case_id: id,
    reason: text,
    contact: contact ? String(contact).slice(0, 200) : null,
    ip_hash: hashIp(await clientIp()),
  });

  const next = c.dispute_count + 1;
  const shouldSuspend = next >= 3 && c.status === "live";
  await supabase
    .from("cases")
    .update({ dispute_count: next, ...(shouldSuspend ? { status: "disputed" } : {}) })
    .eq("id", id);

  await supabase.from("case_events").insert({
    case_id: id, type: "disputed", detail: { suspended: shouldSuspend },
  });

  return NextResponse.json({ ok: true, suspended: shouldSuspend });
}
