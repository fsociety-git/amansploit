import { TOOLS } from "@/lib/data";

export default function ToolMarquee() {
  return (
    <div className="marquee overflow-hidden border-b border-line py-3.5" aria-hidden="true">
      <div className="marquee-track flex w-max gap-10 px-5">
        {[...TOOLS, ...TOOLS].map((t, i) => (
          <span key={i} className="font-mono text-xs text-dim/70 whitespace-nowrap">
            {t} <span className="text-acid/60 ml-8">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
