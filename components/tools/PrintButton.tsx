"use client";

/**
 * "Save as PDF" without a PDF library.
 *
 * The person running a scan is very often not the person who approves spending
 * money on it. What they need is a document they can forward to whoever does —
 * and a screenshot of a web page is a poor way to make that case.
 *
 * Implemented as window.print() plus a print stylesheet rather than a
 * server-rendered PDF, deliberately. Headless Chromium does not fit a
 * serverless function, a JS PDF library means a large client bundle and fresh
 * CSP argument for a once-per-visit action, and every browser already contains
 * an excellent, accessible, well-tested PDF renderer the user already trusts.
 * The print stylesheet in globals.css strips the navigation, the form and this
 * button, and adds the domain and offer as a printed footer.
 *
 * No email wall on this, which is the point: the tools page promises there
 * isn't one, and gating the artifact would make that a lie for the sake of a
 * few addresses.
 */
export default function PrintButton() {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-lg border border-line px-4 py-2 font-mono text-xs text-dim hover:text-acid hover:border-acid/50 transition-colors"
      >
        ↓ Save this as a PDF
      </button>
      <span className="text-[12px] text-dim/80">
        No email required. Forward it to whoever needs to sign it off.
      </span>
    </div>
  );
}
