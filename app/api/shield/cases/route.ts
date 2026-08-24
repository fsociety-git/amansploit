import { NextResponse } from "next/server";
import { db } from "@/lib/shield/supabase";
import { newCaseId, newVerificationCode } from "@/lib/shield/ids";
import { hashIp, sha256, secret, encryptContact } from "@/lib/shield/crypto";
import { clientIp } from "@/lib/shield/net";
import { normaliseHandle, profileUrl } from "@/lib/shield/handles";

export const runtime = "nodejs";

const SEVERITIES = ["existing", "posting_photos", "messaging_contacts", "asking_money"] as const;
const PLATFORMS = ["instagram", "facebook", "whatsapp", "snapchat", "x", "other"] as const;

const RATE_WINDOW_MIN = 60;
const RATE_MAX_CASES = 3;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const platform = String(body.platform ?? "instagram");
  const fakeHandle = normaliseHandle(String(body.fakeHandle ?? ""));
  const realHandle = body.realHandle ? normaliseHandle(String(body.realHandle)) : null;
  const displayName = String(body.displayName ?? "").trim().slice(0, 80);
  const severity = String(body.severity ?? "existing");
  const locale = body.locale === "hi" ? "hi" : "en";
  const consent = body.consent === true;

  if (!PLATFORMS.includes(platform as (typeof PLATFORMS)[number]))
    return NextResponse.json({ error: "Unknown platform." }, { status: 400 });
  if (!fakeHandle)
    return NextResponse.json({ error: "That doesn't look like a valid account link or username." }, { status: 400 });
  if (!displayName)
    return NextResponse.json({ error: "Please tell us the name your friends will recognise." }, { status: 400 });
  if (!SEVERITIES.includes(severity as (typeof SEVERITIES)[number]))
    return NextResponse.json({ error: "Please choose what the fake account is doing." }, { status: 400 });
  if (!consent)
    return NextResponse.json({ error: "We need your consent to store the case." }, { status: 400 });
  if (realHandle && realHandle === fakeHandle)
    return NextResponse.json({ error: "The fake account and your real account cannot be the same." }, { status: 400 });

  const supabase = db();
  const ipHash = hashIp(await clientIp());

  // Rate limit case creation. The point is not spam, it is bulk weaponisation:
  // one actor generating many cases against many real accounts.
  const since = new Date(Date.now() - RATE_WINDOW_MIN * 60_000).toISOString();
  const { count } = await supabase
    .from("creation_events")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);

  if ((count ?? 0) >= RATE_MAX_CASES) {
    return NextResponse.json(
      { error: "Too many cases created from this connection recently. Please wait an hour, or contact us if this is genuine." },
      { status: 429 },
    );
  }

  const id = newCaseId();
  const manageKey = secret(24);
  const verificationCode = `SHIELD-${newVerificationCode()}`;

  const contactValue = String(body.contactValue ?? "").trim();
  const contactChannel = contactValue ? String(body.contactChannel ?? "email") : null;

  const { error } = await supabase.from("cases").insert({
    id,
    manage_key_hash: sha256(manageKey),
    platform,
    fake_handle: fakeHandle,
    fake_url: profileUrl(platform, fakeHandle),
    real_handle: realHandle,
    display_name: displayName,
    severity,
    locale,
    // A case is born dark. It becomes reachable only after ownership is proven.
    status: "pending_verification",
    verification_code: verificationCode,
    contact_channel: contactChannel,
    contact_value_enc: contactValue ? encryptContact(contactValue) : null,
    consent_at: new Date().toISOString(),
  });

  if (error) {
    console.error("case insert failed", error.message);
    return NextResponse.json({ error: "Could not create the case. Please try again." }, { status: 500 });
  }

  await supabase.from("creation_events").insert({ ip_hash: ipHash });
  await supabase.from("case_events").insert({ case_id: id, type: "created", detail: { severity, platform } });

  return NextResponse.json({
    id,
    manageKey,
    verificationCode,
    realHandle,
    severity,
    needsVerification: Boolean(realHandle),
  });
}
