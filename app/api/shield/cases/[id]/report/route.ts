import { NextResponse } from "next/server";
import { db } from "@/lib/shield/supabase";
import { hashIp } from "@/lib/shield/crypto";
import { clientIp } from "@/lib/shield/net";

export const runtime = "nodejs";

/**
 * Records that someone reported the fake account, and returns the live count.
 *
 * The counter is social proof, so it has to be honest — an inflated number is
 * both a lie to the victim and a reason for a friend to stop bothering. Dedup is
 * a unique index on (case_id, ip_hash) enforced in one atomic statement, so
 * repeated taps and double-submits cannot inflate it. A shared NAT will collapse
 * several genuine reporters into one, which undercounts; that is the right way
 * to be wrong.
 */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const supabase = db();

  const { data: c } = await supabase.from("cases").select("id, status").eq("id", id).maybeSingle();
  if (!c) return NextResponse.json({ error: "Case not found." }, { status: 404 });
  if (c.status !== "live")
    return NextResponse.json({ error: "This case is not active." }, { status: 409 });

  const ipHash = hashIp(await clientIp());
  const { data, error } = await supabase.rpc("record_report", {
    p_case_id: id,
    p_ip_hash: ipHash,
    p_user_agent: null,
  });

  if (error) {
    console.error("record_report failed", error.message);
    return NextResponse.json({ error: "Could not record that. Please try again." }, { status: 500 });
  }

  const row = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({ count: row?.count ?? 0, already: row?.already ?? false });
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const supabase = db();
  const { data } = await supabase.from("cases").select("report_count, status").eq("id", id).maybeSingle();
  return NextResponse.json({ count: data?.report_count ?? 0, status: data?.status ?? "unknown" });
}
