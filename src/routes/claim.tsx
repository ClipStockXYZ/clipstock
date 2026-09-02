import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { AddressStrip } from "@/components/addresses";
import { Connect } from "@/components/connect";
import { TOKEN_CA, VAULT_CA, isAddress } from "@/lib/catalog";
import { fmtNvda, readDesk } from "@/lib/chain";
import { shortAddr, useWallet } from "@/lib/wallet";

export const Route = createFileRoute("/claim")({ component: Claim });

function Claim() {
  const address = useWallet((s) => s.address);
  const [clipBal, setClipBal] = useState("0");
  const [nvda, setNvda] = useState("0");
  const [epoch, setEpoch] = useState(0);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const s = await readDesk(address);
        if (!alive) return;
        setClipBal(fmtNvda(s.clipBal));
        setNvda(fmtNvda(s.nvda));
        setEpoch(s.epoch);
      } catch {
        /* */
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [address]);

  const ready = isAddress(VAULT_CA) && isAddress(TOKEN_CA) && Boolean(address);

  return (
    <Shell>
      <h1 className="font-display text-5xl font-semibold tracking-tight">Claim</h1>
      <p className="mt-3 max-w-xl text-lg text-mute">
        Hold $CLIP through the epoch. The desk pays NVDA, not ETH. Proofs go live after the first clip
        settles.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Connect />
        {address ? <p className="font-mono text-sm text-mute">{shortAddr(address)}</p> : null}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card k="Your $CLIP" v={address ? clipBal : "—"} />
        <Card k="Vault NVDA" v={isAddress(VAULT_CA) ? nvda : "—"} />
        <Card k="Epoch" v={isAddress(VAULT_CA) ? String(epoch) : "—"} />
      </div>

      <div className="ticket mt-8 rounded-[var(--radius)] border border-line p-6">
        <h2 className="font-display text-2xl font-medium">This epoch</h2>
        {!address ? (
          <p className="mt-2 text-mute">Connect a wallet on Robinhood 4663.</p>
        ) : !ready ? (
          <p className="mt-2 text-mute">Vault and $CLIP are not live. Claim stays closed until both CAs are set.</p>
        ) : (
          <p className="mt-2 text-mute">No merkle proof for this wallet yet. Harvest, clip, then the keeper posts the epoch.</p>
        )}
        <button
          type="button"
          disabled
          className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm text-bg disabled:opacity-40"
        >
          Claim NVDA
        </button>
      </div>

      <div className="mt-6">
        <AddressStrip />
      </div>
    </Shell>
  );
}

function Card({ k, v }: { k: string; v: string }) {
  return (
    <div className="ticket rounded-[var(--radius)] border border-line p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-mute">{k}</p>
      <p className="mt-1 font-display text-3xl font-medium tabular-nums">{v}</p>
    </div>
  );
}
