import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { AddressStrip } from "@/components/addresses";
import { Tape } from "@/components/tape";
import { CREATOR_TAX, GH_URL, LINE, PAD_DOCS, PAD_URL, SITE_URL, TG_URL, X_URL } from "@/lib/catalog";

export const Route = createFileRoute("/paper")({ component: Paper });

const ROWS = [
  ["Pad", "LetsCash"],
  ["Pair", "ETH"],
  ["Fee recipient", "ClipVault, not an EOA"],
  ["Creator tax", `${CREATOR_TAX}% to ClipVault`],
  ["Harvest", "ETH lands in the vault. Harvest pulls leftovers"],
  ["Clip", "Keeper buys a listed name (default NVDA). setClipAsset when the bag is empty"],
  ["Pay", "That epoch's shares to $CLIP holders, 15 minutes"],
  ["Tape", "NVDA SPY AAPL TSLA MSFT META PLTR COIN GOOGL AMZN RBLX — all listed on the vault"],
  ["Snipe", "Team wallets only, fixed at launch"],
];

function Paper() {
  return (
    <Shell>
      <h1 className="font-display text-5xl font-semibold tracking-tight">Paper</h1>
      <p className="mt-3 max-w-xl text-lg text-mute">{LINE}</p>

      <section className="ticket mt-8 overflow-hidden rounded-[var(--radius)] border border-line">
        <img src="/desk/cover.jpg" alt="ClipStock tape cover" className="w-full object-cover" />
      </section>

      <section className="ticket mt-8 overflow-hidden rounded-[var(--radius)] border border-line">
        <img src="/desk/flow.jpg" alt="Harvest, clip, tape, claim" className="w-full object-cover" />
      </section>

      <section className="ticket mt-8 overflow-hidden rounded-[var(--radius)] border border-line">
        {ROWS.map(([k, v]) => (
          <div key={k} className="flex flex-wrap items-baseline justify-between gap-3 border-t border-line px-5 py-4 first:border-t-0">
            <p className="text-sm text-mute">{k}</p>
            <p className="text-sm text-ink">{v}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <article className="ticket rounded-[var(--radius)] border border-line p-6">
          <h2 className="font-display text-2xl font-medium">Launch order</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-mute">
            <li>Deploy ClipVault. Keeper = your crank EOA.</li>
            <li>LetsCash: pair ETH, tax {CREATOR_TAX}%, fee recipient = vault.</li>
            <li>Paste $CLIP into the vault with setClipToken.</li>
            <li>Site catalog gets both CAs. Harvest is public. Clip is keeper.</li>
          </ol>
        </article>
        <article className="ticket rounded-[var(--radius)] border border-line p-6">
          <h2 className="font-display text-2xl font-medium">Links</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a className="text-forest underline" href={SITE_URL} target="_blank" rel="noreferrer">
                clipstock.xyz
              </a>
            </li>
            <li>
              <a className="text-forest underline" href={X_URL} target="_blank" rel="noreferrer">
                x.com/clipstockXYZ
              </a>
            </li>
            <li>
              <a className="text-forest underline" href={GH_URL} target="_blank" rel="noreferrer">
                github.com/ClipStockXYZ/clipstock
              </a>
            </li>
            <li>
              <a className="text-forest underline" href={TG_URL} target="_blank" rel="noreferrer">
                t.me/ClipStock
              </a>
            </li>
            <li>
              <a className="text-forest underline" href={PAD_URL} target="_blank" rel="noreferrer">
                letscash.fun
              </a>
            </li>
            <li>
              <a className="text-forest underline" href={PAD_DOCS} target="_blank" rel="noreferrer">
                LetsCash docs
              </a>
            </li>
          </ul>
        </article>
      </section>

      <div className="mt-8">
        <Tape />
      </div>

      <div className="mt-8">
        <AddressStrip />
      </div>
    </Shell>
  );
}
