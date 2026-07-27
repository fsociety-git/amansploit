"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LINKS } from "@/lib/data";

type Cmd = { label: string; hint: string; action: () => void };

export default function CommandPalette({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);

  const go = useCallback(
    (id: string) => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      setOpen(false);
    },
    [setOpen]
  );

  const cmds: Cmd[] = [
    { label: "goto services", hint: "What I do", action: () => go("services") },
    { label: "goto work", hint: "Case studies", action: () => go("work") },
    { label: "goto process", hint: "How engagements run", action: () => go("process") },
    { label: "goto about", hint: "Who I am", action: () => go("about") },
    { label: "goto contact", hint: "Start a project", action: () => go("contact") },
    { label: "free tools", hint: "Headers + email spoofing", action: () => { window.location.href = "/tools"; } },
    { label: "writing", hint: "Notes and guides", action: () => { window.location.href = "/blog"; } },
    { label: "mail me", hint: LINKS.email, action: () => { window.location.href = `mailto:${LINKS.email}`; } },
    { label: "open linkedin", hint: "/in/aman-sonkamble", action: () => { window.open(LINKS.linkedin, "_blank"); } },
  ];

  const filtered = cmds.filter((c) =>
    (c.label + " " + c.hint).toLowerCase().includes(q.toLowerCase())
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
        setQ("");
        setIdx(0);
      }
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter" && filtered[idx]) { e.preventDefault(); filtered[idx].action(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen, filtered, idx]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center pt-[18vh] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            className="relative w-full max-w-lg card-line rounded-xl overflow-hidden shadow-2xl"
            initial={{ scale: 0.96, y: -8 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
              <span className="text-acid font-mono text-sm">❯</span>
              <input
                autoFocus
                value={q}
                onChange={(e) => { setQ(e.target.value); setIdx(0); }}
                placeholder="jump to…"
                className="w-full bg-transparent outline-none font-mono text-sm text-ink placeholder:text-dim/50"
              />
              <kbd className="font-mono text-[10px] text-dim border border-line rounded px-1.5 py-0.5">ESC</kbd>
            </div>
            <ul className="max-h-72 overflow-y-auto py-2">
              {filtered.length === 0 && (
                <li className="px-4 py-3 font-mono text-sm text-dim">no match — try &quot;goto contact&quot;</li>
              )}
              {filtered.map((c, i) => (
                <li key={c.label}>
                  <button
                    onClick={c.action}
                    onMouseEnter={() => setIdx(i)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 sm:py-2.5 text-left font-mono text-sm transition-colors ${
                      i === idx ? "bg-acid/10 text-acid" : "text-ink"
                    }`}
                  >
                    <span>{c.label}</span>
                    <span className="text-xs text-dim">{c.hint}</span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
