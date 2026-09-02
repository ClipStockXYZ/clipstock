import { TAPE } from "@/lib/catalog";

export function TapeRibbon() {
  const loop = [...TAPE, ...TAPE, ...TAPE, ...TAPE];
  return (
    <div className="overflow-hidden border-b border-line bg-paper">
      <div className="tape-track gap-8 px-4 py-2 font-mono text-xs tracking-wide text-mute">
        {loop.map((s, i) => (
          <span key={`${s.ticker}-${i}`} className="flex items-center gap-2">
            <span className="inline-block size-1.5 rounded-full bg-forest" />
            {s.ticker}
            <span className="text-brass">·</span>
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
