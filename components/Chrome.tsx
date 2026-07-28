"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

/**
 * Site chrome: skip link, scroll progress, keyboard help, toasts.
 *
 * Grouped in one client module because they all need to exist on every page and
 * all listen to the same global events. Splitting them into five files would
 * mean five mount points in the layout and five separate keydown listeners.
 */

/* ── skip to content ──────────────────────────────────────────────────── */

/**
 * The only item in this file that fixes a defect rather than adding a flourish.
 * Without it, a keyboard user tabs through every navigation link on every page
 * load before reaching anything they came for. Invisible until focused, which
 * is why almost nobody notices it is missing.
 */
export function SkipLink() {
  return (
    <a
      href="#content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-lg focus:bg-acid focus:px-4 focus:py-2.5 focus:font-semibold focus:text-void focus:outline-none focus:ring-2 focus:ring-ink"
    >
      Skip to content
    </a>
  );
}

/* ── scroll progress ──────────────────────────────────────────────────── */

export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const p = max > 0 ? Math.min(1, el.scrollTop / max) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    // Written straight to style in a rAF rather than through React state: this
    // fires on every scroll frame, and a setState per frame would re-render the
    // whole tree for a one-pixel bar.
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-[150] h-[2px] pointer-events-none">
      <div ref={bar} className="h-full origin-left bg-acid/70 scale-x-0" />
    </div>
  );
}

/* ── toasts ───────────────────────────────────────────────────────────── */

interface Toast {
  id: number;
  text: string;
}
const ToastCtx = createContext<(text: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastHost({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const next = useRef(0);

  const push = useCallback((text: string) => {
    const id = ++next.current;
    setItems((s) => [...s, { id, text }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 2600);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      {/* aria-live so the confirmation reaches a screen reader too — a visual
          toast alone tells a sighted user the copy worked and tells everyone
          else nothing. */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[190] flex flex-col items-center gap-2 pointer-events-none print:hidden"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className="rounded-lg border border-acid/40 bg-panel px-4 py-2.5 font-mono text-[12px] text-ink shadow-lg"
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ── copy button ──────────────────────────────────────────────────────── */

export function CopyButton({
  value,
  label,
  className = "",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const toast = useToast();
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          toast(`Copied ${label ?? value}`);
          setTimeout(() => setDone(false), 1800);
        } catch {
          // Clipboard needs a secure context and permission; if it is refused,
          // say so rather than silently appearing to work.
          toast("Couldn't copy — select and copy manually");
        }
      }}
      aria-label={`Copy ${label ?? value}`}
      className={`font-mono text-[11px] text-dim hover:text-acid transition-colors ${className}`}
    >
      {done ? "copied ✓" : "copy"}
    </button>
  );
}

/* ── keyboard help ────────────────────────────────────────────────────── */

const KEYS: [string, string][] = [
  ["⌘K / Ctrl K", "Open the command palette"],
  ["?", "Show this sheet"],
  ["Tab", "Move through links — the first stop is “skip to content”"],
  ["Esc", "Close whatever is open"],
  ["G then H", "Go home"],
  ["G then T", "Go to the free tools"],
  ["G then W", "Go to the writing"],
];

export function KeyboardHelp() {
  const [open, setOpen] = useState(false);
  const [reduced, setReduced] = useState(false);
  const chord = useRef<string | null>(null);

  useEffect(() => {
    setReduced(document.documentElement.dataset.motion === "reduced");
  }, []);

  useEffect(() => {
    const typing = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      return (
        !!el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT" ||
          el.isContentEditable)
      );
    };

    const onKey = (e: KeyboardEvent) => {
      if (typing(e.target)) return;
      if (e.key === "Escape") return setOpen(false);
      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault();
        return setOpen((o) => !o);
      }
      // "g then h" style chords — a second key within a moment of pressing g.
      if (e.key.toLowerCase() === "g" && !e.metaKey && !e.ctrlKey) {
        chord.current = "g";
        setTimeout(() => (chord.current = null), 900);
        return;
      }
      if (chord.current === "g") {
        chord.current = null;
        const to = { h: "/", t: "/tools", w: "/blog" }[e.key.toLowerCase()];
        if (to) {
          e.preventDefault();
          window.location.href = to;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleMotion = () => {
    const nowReduced = !reduced;
    setReduced(nowReduced);
    document.documentElement.dataset.motion = nowReduced ? "reduced" : "full";
    try {
      localStorage.setItem("motion", nowReduced ? "reduced" : "full");
    } catch {
      /* private mode — the setting just won't persist */
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      className="fixed inset-0 z-[195] grid place-items-center bg-void/80 p-5 print:hidden"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-line bg-panel p-6"
      >
        <div className="flex items-baseline justify-between">
          <h2 className="font-display font-bold text-xl">Keyboard</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="font-mono text-xs text-dim hover:text-acid"
          >
            esc
          </button>
        </div>

        <dl className="mt-5 space-y-2.5">
          {KEYS.map(([k, v]) => (
            <div key={k} className="flex items-baseline gap-4">
              <dt className="w-28 shrink-0 font-mono text-[11px] text-acid">{k}</dt>
              <dd className="text-[13px] text-dim leading-snug">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 pt-5 border-t border-line/70 flex items-center justify-between gap-4">
          <div>
            <div className="text-[13px] text-ink">Reduce motion</div>
            <p className="mt-0.5 text-[11px] text-dim leading-snug">
              Your system setting is respected automatically. This overrides it for this
              browser.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={reduced}
            onClick={toggleMotion}
            className={`shrink-0 rounded-full w-11 h-6 transition-colors ${reduced ? "bg-acid" : "bg-line"}`}
          >
            <span
              className={`block h-5 w-5 rounded-full bg-void transition-transform ${reduced ? "translate-x-5" : "translate-x-0.5"}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
