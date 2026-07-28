"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const CHARS = "ABCDEF0123456789#$%&@!?<>/\\|=+*";

/**
 * Scramble-in text that is correct before JavaScript runs.
 *
 * The earlier version initialised state to an empty string, which meant the
 * server rendered an EMPTY element. On the homepage that element is the
 * <h1> — so Google indexed a page whose single most important heading had no
 * text, link previews had nothing to quote, and a visitor with JavaScript off
 * saw a blank hero. The animation looked fine, which is exactly why it went
 * unnoticed: the defect only existed in the HTML nobody looks at.
 *
 * Same fix as Counter: render the real text on the server, then — after
 * hydration, only if motion is allowed, and in a layout effect so it happens
 * before paint — replace it with the scramble and animate back. No flash of
 * final text, and the pre-JS document is correct.
 */
export default function DecryptText({
  text,
  className = "",
  delay = 0,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: React.ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  // Server and first client render both produce the real text.
  const [display, setDisplay] = useState(text);
  const started = useRef(false);
  const armed = useRef(false);
  const raf = useRef(0);

  useIsoLayoutEffect(() => {
    if (reduced) return; // honour the preference: never scramble, never hide
    armed.current = true;
    setDisplay(""); // before paint, so the final text is never briefly visible
  }, [reduced]);

  /**
   * Driven by elapsed time in a rAF loop, not by counting setInterval ticks.
   *
   * The tick-counting version assumed 24ms intervals actually arrive every
   * 24ms. Browsers throttle timers hard in backgrounded tabs and on phones in
   * low-power mode — measured at ~1300ms per tick in one environment, which
   * turned a one-second reveal into something that had not finished after ten.
   * With frame counting, a throttled timer leaves the headline permanently
   * scrambled; the site's largest text becomes gibberish and never recovers.
   *
   * Progress from a timestamp fixes that by construction. However slowly the
   * loop runs, each pass computes where the animation *should* be, so a
   * throttled tab simply skips ahead and lands on the finished text.
   */
  const run = useCallback(() => {
    const total = text.length;
    const MS_PER_CHAR = 72; // ≈ the old 3 frames × 24ms, now in real time
    const duration = total * MS_PER_CHAR;
    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      if (elapsed >= duration) {
        setDisplay(text); // always converge, whatever the frame rate was
        raf.current = 0;
        return;
      }
      const settled = Math.floor(elapsed / MS_PER_CHAR);
      let out = "";
      for (let i = 0; i < total; i++) {
        if (i < settled) out += text[i];
        else if (text[i] === " ") out += " ";
        else out += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      setDisplay(out);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, [text]);

  useEffect(() => {
    if (!inView || started.current || !armed.current) return;
    started.current = true;
    const t = setTimeout(run, delay);
    return () => {
      clearTimeout(t);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [inView, delay, run]);

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {display || " "}
    </Tag>
  );
}
