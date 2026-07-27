"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import CommandPalette from "./CommandPalette";

const ITEMS = [
  { id: "services", label: "Services" },
  { id: "work", label: "Work" },
  { id: "process", label: "Process" },
  { id: "about", label: "About" },
];

export default function Nav() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <>
      <motion.header
        className="fixed top-0 inset-x-0 z-[80] border-b border-line/60 bg-void/70 backdrop-blur-md"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="mx-auto max-w-6xl px-5 h-14 flex items-center justify-between">
          <a href="#top" className="font-mono text-sm text-ink tracking-tight">
            <span className="text-acid">aman</span>sploit<span className="text-acid">@</span>sec:~$
          </a>
          <nav className="hidden md:flex items-center gap-7">
            {ITEMS.map((it) => (
              <a
                key={it.id}
                href={`#${it.id}`}
                className="text-sm text-dim hover:text-acid transition-colors"
              >
                {it.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {/* On desktop this is the ⌘K hint; on mobile it *is* the navigation. */}
            <button
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2 font-mono text-[11px] text-dim border border-line rounded-md px-2.5 py-2 sm:py-1.5 hover:border-acid/50 hover:text-acid transition-colors"
              aria-label="Open menu"
            >
              <span className="hidden sm:inline">⌘K</span>
              <svg
                className="sm:hidden h-4 w-4"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M3 6h14M3 10h14M3 14h14" />
              </svg>
            </button>
            <a
              href="#contact"
              className="text-sm font-medium bg-acid text-void rounded-md px-4 py-1.5 hover:bg-acid/85 transition-colors"
            >
              Hire me
            </a>
          </div>
        </div>
      </motion.header>
      <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} />
    </>
  );
}
