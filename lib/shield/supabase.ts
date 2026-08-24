import { createClient } from "@supabase/supabase-js";

/**
 * Server-only client using the service role key.
 *
 * Every table has RLS enabled with no policies, which denies anon and
 * authenticated roles outright. That is deliberate rather than lazy: the public
 * case page is read by strangers with no account, so there is no client-side
 * identity to write a policy against, and any anon-readable policy on `cases`
 * would expose every victim's manage-key hash and encrypted contact details.
 * All access therefore goes through server routes that decide what to return.
 *
 * This module must never be imported into a client component.
 */
export function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase environment variables are not set");
  return createClient(url, key, { auth: { persistSession: false } });
}
