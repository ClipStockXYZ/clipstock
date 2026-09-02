import { useEffect, useState } from "react";
import { EXPLORER_URL, NVDA_CA, TAPE, fmtUsd } from "@/lib/catalog";
import { readDesk } from "@/lib/chain";

type Row = (typeof TAPE)[number] & { vol: number };

type Pair = {
  chainId?: string;
  volume?: { h24?: number };
  baseToken?: { address?: string };
};

export function Tape() {
  const [rows, setRows] = useState<Row[]>(TAPE.map((s) => ({ ...s, vol: 0 })));
  const [asset, setAsset] = useState(NVDA_CA);

  useEffect(() => {
    let alive = true;
    readDesk().then((s) => {
      if (alive && s.asset) setAsset(s.asset);
    });
    const addrs = TAPE.map((s) => s.ca).join(",");
    fetch(`https://api.dexscreener.com/latest/dex/tokens/${addrs}`)
      .then((r) => r.json())
      .then((j: { pairs?: Pair[] }) => {
        if (!alive) return;
        const vol = new Map<string, number>();
        for (const p of j.pairs ?? []) {
          if (p.chainId && p.chainId !== "robinhood") continue;
          const a = p.baseToken?.address?.toLowerCase();
          if (!a) continue;
          vol.set(a, (vol.get(a) ?? 0) + (p.volume?.h24 ?? 0));
        }
        const next = TAPE.map((s) => ({ ...s, vol: vol.get(s.ca.toLowerCase()) ?? 0 }));
        next.sort((a, b) => b.vol - a.vol);
        setRows(next);
      })
      .catch(() => {
        /* listed order, no fake numbers */
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="ticket overflow-hidden rounded-[var(--radius)] border border-line">
      <div className="flex flex-wrap items-end justify-between gap-3 px-6 py-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-mute">Robinhood tape · 24h volume</p>
          <h2 className="mt-1 font-display text-3xl font-medium">Eleven names. One desk.</h2>
        </div>
        <p className="max-w-sm text-sm text-mute">
          Every ticker is listed on ClipVault. The keeper clips the thick book that epoch. Default is NVDA.
        </p>
      </div>
      <div className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((s) => {
          const on = s.ca.toLowerCase() === asset.toLowerCase();
          return (
            <a
              key={s.ticker}
              href={`${EXPLORER_URL}/token/${s.ca}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-baseline justify-between gap-3 border-t border-line px-6 py-4 hover:bg-bg sm:border-r"
            >
              <span className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium">{s.ticker}</span>
                {on ? (
                  <span className="rounded-full bg-forest px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-forest-fg">
                    clipping
                  </span>
                ) : (
                  <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wide text-mute">listed</span>
                )}
              </span>
              <span className="font-mono text-sm tabular-nums text-mute">{fmtUsd(s.vol) || "—"}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
