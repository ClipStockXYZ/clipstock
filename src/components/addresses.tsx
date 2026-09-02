import { useState } from "react";
import { EXPLORER_URL, NVDA_CA, TOKEN_CA, VAULT_CA, isAddress, shortCa } from "@/lib/catalog";

function Row({ label, value, empty }: { label: string; value: string; empty: string }) {
  const [copied, setCopied] = useState(false);
  const live = isAddress(value);
  async function copy() {
    if (!live) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 first:border-t-0">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-mute">{label}</p>
        <p className="mt-1 font-mono text-sm text-ink">{live ? value : empty}</p>
      </div>
      <div className="flex gap-2">
        {live ? (
          <>
            <button type="button" onClick={copy} className="rounded-full border border-line bg-paper px-3 py-1.5 text-xs">
              {copied ? "Copied" : "Copy"}
            </button>
            <a
              href={`${EXPLORER_URL}/address/${value}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-forest px-3 py-1.5 text-xs font-medium text-forest-fg"
            >
              Explorer
            </a>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function AddressStrip() {
  return (
    <section className="ticket overflow-hidden rounded-[var(--radius)] border border-line">
      <Row label="$CLIP" value={TOKEN_CA} empty="— waiting Pons V2" />
      <Row label="ClipVault" value={VAULT_CA} empty="— deploy next" />
      <Row label="NVDA" value={NVDA_CA} empty="" />
    </section>
  );
}

export function VaultChip() {
  if (!isAddress(VAULT_CA)) return null;
  return (
    <a
      href={`${EXPLORER_URL}/address/${VAULT_CA}`}
      target="_blank"
      rel="noreferrer"
      className="font-mono text-[11px] text-mute hover:text-ink"
    >
      Vault {shortCa(VAULT_CA)}
    </a>
  );
}
