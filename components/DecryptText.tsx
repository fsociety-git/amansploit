"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const CHARS = "ABCDEF0123456789#$%&@!?<>/\\|=+*";

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
  const [display, setDisplay] = useState(reduced ? text : "");
  const started = useRef(false);

  const run = useCallback(() => {
    const total = text.length;
    let frame = 0;
    const perChar = 3; // frames of scramble per character
    const timer = setInterval(() => {
      frame++;
      const settled = Math.floor(frame / perChar);
      let out = "";
      for (let i = 0; i < total; i++) {
        if (i < settled) out += text[i];
        else if (text[i] === " ") out += " ";
        else out += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      setDisplay(out);
      if (settled >= total) clearInterval(timer);
    }, 24);
    return timer;
  }, [text]);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    if (reduced) {
      setDisplay(text);
      return;
    }
    const t = setTimeout(() => run(), delay);
    return () => clearTimeout(t);
  }, [inView, reduced, delay, run, text]);

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {display || " "}
    </Tag>
  );
}
