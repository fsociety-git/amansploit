import { NextResponse } from "next/server";
import { db } from "@/lib/shield/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Deletes cases past their 90-day retention date, and the evidence with them.
 *
 * Order matters. Storage objects are removed BEFORE the rows that name them: if
 * the rows went first, the paths would be lost and the files would sit in the
 * bucket forever, which is precisely the outcome the retention promise exists to
 * prevent. The SQL function therefore returns the paths as it deletes.
 *
 * Authenticated by CRON_SECRET. Vercel sends it as a bearer token; without the
 * check, anyone who found the URL could trigger deletions.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 500 });

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`)
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });

  const supabase = db();
  const { data, error } = await supabase.rpc("purge_expired_cases");
  if (error) {
    console.error("purge failed", error.message);
    return NextResponse.json({ error: "Purge failed." }, { status: 500 });
  }

  const rows = (data ?? []) as Array<{ deleted_case_id: string; storage_paths: string[] }>;
  const paths = rows.flatMap((r) => r.storage_paths ?? []);

  let removed = 0;
  // Chunked: Supabase's remove() takes a bounded list, and a month of expiries
  // can be larger than one call comfortably handles.
  for (let i = 0; i < paths.length; i += 100) {
    const chunk = paths.slice(i, i + 100);
    const { error: rmErr } = await supabase.storage.from("evidence").remove(chunk);
    if (!rmErr) removed += chunk.length;
  }

  return NextResponse.json({
    ok: true,
    casesDeleted: rows.length,
    filesDeleted: removed,
    filesExpected: paths.length,
  });
}
