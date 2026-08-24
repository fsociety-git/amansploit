import Link from "next/link";
import { ShieldMark } from "@/components/shield/Brand";

/**
 * The one entry on this page addressed to someone in trouble rather than someone
 * shopping.
 *
 * Placed immediately below the opening act, because a person who has just found
 * a fake account with their face on it does not scroll a consulting homepage
 * looking for a services grid — they scan the first screen and leave. Everything
 * else here can wait for a visitor who is calm.
 *
 * Deliberately quiet in styling. An alarm-red banner on a portfolio reads as
 * marketing urgency, which is the register this site exists to avoid; the point
 * is to be findable, not loud.
 */
export default function ShieldCallout() {
  return (
    <section className="border-b border-line/60">
      <div className="mx-auto max-w-6xl px-5 py-5">
        <Link
          href="/shield"
          className="group flex flex-col gap-3 rounded-xl border border-line px-5 py-4 transition-colors hover:border-acid/45 sm:flex-row sm:items-center sm:gap-5"
        >
          <span className="shrink-0 text-acid"><ShieldMark size={26} /></span>

          <span className="flex-1">
            <span className="block font-display font-bold text-[16px] leading-snug text-ink">
              Someone impersonating you right now?
            </span>
            <span className="mt-1 block text-[14px] leading-relaxed text-dim">
              Shield gets your contacts reporting the fake account within minutes, preserves the
              evidence, and drafts your cybercrime complaint. Free, no signup, English and Hindi.
            </span>
          </span>

          <span className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-acid group-hover:underline">
            Open Shield →
          </span>
        </Link>
      </div>
    </section>
  );
}
