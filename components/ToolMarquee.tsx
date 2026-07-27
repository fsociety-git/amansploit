"use client";

import { useEffect, useRef } from "react";
import { TOOLS } from "@/lib/data";

/**
 * Decorative infinite ticker.
 *
 * A seamless CSS marquee needs the list rendered twice — the track translates
 * -50% and the copy takes over. But shipping both copies in the HTML means
 * crawlers, preview bots, and text extraction read every tool name twice.
 *
 * So the server renders the list ONCE (clean text), and the client clones it
 * into an aria-hidden duplicate after mount. Screen readers never see the copy,
 * text extraction never sees the copy, and the loop is still seamless.
 *
 * Degradation: with JS disabled the single copy still scrolls (pure CSS, just
 * without a seamless wrap) inside an overflow-hidden strip — decorative either
 * way. Under prefers-reduced-motion the animation is off and the duplicate is
 * hidden by CSS, so no stray repeated row.
 */
export default function ToolMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const list = listRef.current;
    if (!track || !list || track.dataset.cloned === "1") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const copy = list.cloneNode(true) as HTMLDivElement;
    copy.setAttribute("aria-hidden", "true");
    copy.classList.add("marquee-dup");
    track.appendChild(copy);
    track.dataset.cloned = "1";
  }, []);

  return (
    <div className="marquee overflow-hidden border-b border-line py-3.5">
      <div ref={trackRef} className="marquee-track flex w-max">
        <div ref={listRef} className="flex gap-10 px-5 shrink-0">
          {TOOLS.map((t) => (
            <span key={t} className="font-mono text-xs text-dim/70 whitespace-nowrap">
              {t} <span className="text-acid/60 ml-8">·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
