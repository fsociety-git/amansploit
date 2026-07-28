"use client";

import { useEffect } from "react";

/**
 * Makes deep links actually land.
 *
 * The homepage opens with a 420vh scroll-driven hero, and several sections
 * below it size themselves after hydration. The browser performs its native
 * hash scroll before any of that settles, so it either scrolls to the wrong
 * offset or gets reset to the top — meaning /#estimate, /#self-scan and
 * /#contact all dumped visitors at the hero and left them to scroll blind.
 *
 * That matters more than it sounds: those links are published off-site, in the
 * LinkedIn profile and in blog posts, where nobody can be told to "just scroll".
 *
 * The fix waits for layout to stop moving rather than guessing a delay — two
 * animation frames, then a settle check comparing the target's position across
 * frames until it stops changing (or we run out of patience). `behavior:
 * "instant"` is deliberate: globals.css sets scroll-behavior: smooth, and a
 * four-screen smooth scroll on arrival is its own kind of broken.
 */
export default function HashScroll() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (!id || id === "top") return;

    let cancelled = false;
    let attempts = 0;
    let lastTop = Number.NaN;

    const settle = () => {
      if (cancelled) return;
      const el = document.getElementById(id);
      if (!el) {
        // Section may not be mounted yet — keep looking, briefly.
        if (attempts++ < 40) requestAnimationFrame(settle);
        return;
      }

      const top = el.getBoundingClientRect().top + window.scrollY;
      el.scrollIntoView({ behavior: "instant", block: "start" });

      // Stop once the target's document position holds still between frames,
      // which is the honest signal that layout has finished shifting.
      if (top !== lastTop && attempts++ < 40) {
        lastTop = top;
        requestAnimationFrame(settle);
      }
    };

    // Two frames first, so hydration has committed before we measure anything.
    requestAnimationFrame(() => requestAnimationFrame(settle));
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
