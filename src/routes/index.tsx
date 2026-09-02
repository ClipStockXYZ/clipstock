import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { AddressStrip } from "@/components/addresses";
import { ClipMark } from "@/components/clip-mark";
import { Connect } from "@/components/connect";
import { CREATOR_TAX, LINE, PONS_URL, TOKEN_TICKER, VAULT_CA, isAddress } from "@/lib/catalog";
import { encodeHarvest, fmtEth, fmtNvda, readDesk, sendVault } from "@/lib/chain";
import { useWallet } from "@/lib/wallet";

export const Route = createFileRoute("/")({ component: Home });

const STEPS = [
  { n: "01", t: "Pons V2", d: "ETH pair. Holder sharing off. Creator tax 5% to the vault." },
  { n: "02", t: "Harvest", d: "Pons sweeps fees to escrow. Anyone pulls them here." },
  { n: "03", t: "Clip", d: "The desk wraps ETH and buys NVDA on Uniswap V3." },
  { n: "04", t: "Claim", d: "Every 15 minutes holders take their share of the shares." },
];

function Home() {
  const address = useWallet((s) => s.address);
  const [eth, setEth] = useState("0");
  const [nvda, setNvda] = useState("0");
  const [epoch, setEpoch] = useState(0);
  const [note, setNote] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const s = await readDesk(address);
        if (!alive) return;
        setEth(fmtEth(s.eth));
        setNvda(fmtNvda(s.nvda));
        setEpoch(s.epoch);
      } catch {
        /* empty desk */
      }
    }
    load();
    const t = setInterval(load, 20_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [address]);

  async function harvest() {
    setNote("");
    try {
      await sendVault(encodeHarvest());
      setNote("Harvest sent.");
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Failed.");
    }
  }

  return (
    <Shell>
      <section className="ticket overflow-hidden rounded-[var(--radius)] border border-line">
        <div className="flex items-start justify-between gap-6 px-6 py-8 sm:px-10 sm:py-12">
          <div className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-mute">Robinhood Chain · $CLIP</p>
            <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight sm:text-7xl">ClipStock</h1>
            <p className="mt-4 max-w-md text-lg text-mute">{LINE}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Connect />
              <Link to="/claim" className="rounded-full border border-line bg-paper px-4 py-2 text-sm">
                Claim NVDA
              </Link>
              <a href={PONS_URL} target="_blank" rel="noreferrer" className="text-sm text-mute hover:text-ink">
                Launch on Pons V2
              </a>
            </div>
          </div>
          <ClipMark className="hidden h-28 w-28 sm:block" />
        </div>
        <div className="grid border-t border-line sm:grid-cols-3">
          <Stat k="Vault ETH" v={`${eth} Ξ`} />
          <Stat k="NVDA bag" v={nvda} />
          <Stat k="Epoch" v={isAddress(VAULT_CA) ? String(epoch) : "—"} />
        </div>
      </section>

      <div className="mt-6">
        <AddressStrip />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {STEPS.map((s) => (
          <article key={s.n} className="ticket rounded-[var(--radius)] border border-line p-6">
            <p className="font-mono text-xs text-brass">{s.n}</p>
            <h2 className="mt-2 font-display text-3xl font-medium">{s.t}</h2>
            <p className="mt-2 text-mute">{s.d}</p>
          </article>
        ))}
      </div>

      <section className="ticket mt-8 rounded-[var(--radius)] border border-line p-6 sm:p-8">
        <h2 className="font-display text-3xl font-medium">The desk</h2>
        <p className="mt-2 max-w-2xl text-mute">
          Pons already pays quote crumbs if you flip holder sharing. We do not. ${TOKEN_TICKER} trades in ETH.
          Creator tax {CREATOR_TAX}% lands in ClipVault. The vault buys NVIDIA • Robinhood Token. You claim the
          paper, not the gas.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={harvest}
            disabled={!isAddress(VAULT_CA) || !address}
            className="rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-forest-fg disabled:opacity-40"
          >
            Harvest escrow
          </button>
          <Link to="/paper" className="rounded-full border border-line px-5 py-2.5 text-sm">
            Read the paper
          </Link>
        </div>
        {note ? <p className="mt-3 text-sm text-forest">{note}</p> : null}
      </section>
    </Shell>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="border-line px-6 py-5 sm:border-r sm:last:border-r-0">
      <p className="text-xs uppercase tracking-[0.16em] text-mute">{k}</p>
      <p className="mt-1 font-display text-3xl font-medium tabular-nums">{v}</p>
    </div>
  );
}
