"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Count-up that is correct before JavaScript runs.
 *
 * The server (and any crawler, LinkedIn preview bot, or no-JS visitor) renders
 * the REAL number. Only after hydration — and only if motion is allowed — does
 * the client reset to 0 in a layout effect, before paint, so there is no flash.
 *
 * `play` drives the animation instead of an intersection observer: these live
 * in a fixed overlay that is always geometrically on screen, so an observer
 * would fire at page load and finish long before the beat is actually visible.
 */
export default function Counter({
  value,
  prefix = "",
  suffix = "",
  play = true,
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  play?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(value); // SSR-correct
  const armed = useRef(false);
  const done = useRef(false);

  useIsoLayoutEffect(() => {
    if (reduced) return;
    armed.current = true;
    setN(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!play || reduced || done.current || !armed.current) return;
    done.current = true;

    const dur = 1400;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - t0) / dur, 1);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, reduced, value]);

  return (
    <span className={className}>
      {prefix}
      {n}
      {suffix}
    </span>
  );
}
