import { NVDA_CA, TOKEN_CA, VAULT_CA, isAddress } from "./catalog";
import { RH_RPC, ensureChain, useWallet, type Eip } from "./wallet";

export const SEL = {
  harvest: "0x4641257d",
  clip: "0x3f590980",
  epoch: "0x900cf0cf",
  epochEndsAt: "0xb0dd24c8",
  unassigned: "0x73afce6e",
  clipToken: "0x54e1d59f",
  clipAsset: "0x7aec4e12",
  poolFee: "0x089fe6aa",
  minClip: "0xf87038aa",
  keeper: "0xaced1661",
  owner: "0x8da5cb5b",
  balanceOf: "0x70a08231",
} as const;

function word(n: bigint | number | string) {
  if (typeof n === "string") {
    const h = n.startsWith("0x") ? n.slice(2) : n;
    return h.padStart(64, "0");
  }
  return BigInt(n).toString(16).padStart(64, "0");
}

function asHex(v: unknown) {
  if (typeof v !== "string" || !v.startsWith("0x")) return "";
  return v;
}

function asBig(hex: string) {
  if (!hex || hex === "0x") return 0n;
  return BigInt(hex);
}

function asAddr(hex: string) {
  if (!hex || hex === "0x" || hex.length < 42) return "";
  return `0x${hex.slice(-40)}`;
}

function rpcBody(method: string, params: unknown[]) {
  return JSON.stringify({ jsonrpc: "2.0", id: 1, method, params });
}

async function call(to: string, data: string): Promise<string> {
  if (!isAddress(to)) return "0x0";
  const p = useWallet.getState().provider;
  if (p) {
    try {
      const res = await p.request({ method: "eth_call", params: [{ to, data }, "latest"] });
      return asHex(res);
    } catch {
      /* public rpc */
    }
  }
  const res = await fetch(RH_RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: rpcBody("eth_call", [{ to, data }, "latest"]),
  });
  const j = (await res.json()) as { result?: string; error?: { message?: string } };
  if (!j.result) throw new Error(j.error?.message ?? "rpc");
  return j.result;
}

export type DeskSnap = {
  eth: bigint;
  bag: bigint;
  asset: string;
  unassigned: bigint;
  epoch: number;
  epochEndsAt: number;
  minClip: bigint;
  clipBal: bigint;
};

export async function readDesk(who = ""): Promise<DeskSnap> {
  const empty: DeskSnap = {
    eth: 0n,
    bag: 0n,
    asset: NVDA_CA,
    unassigned: 0n,
    epoch: 0,
    epochEndsAt: 0,
    minClip: 0n,
    clipBal: 0n,
  };
  if (!isAddress(VAULT_CA)) return empty;
  const [ethH, assetH, unH, epH, endsH, minH] = await Promise.all([
    fetch(RH_RPC, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: rpcBody("eth_getBalance", [VAULT_CA, "latest"]),
    }).then((r) => r.json() as Promise<{ result?: string }>),
    call(VAULT_CA, SEL.clipAsset),
    call(VAULT_CA, SEL.unassigned),
    call(VAULT_CA, SEL.epoch),
    call(VAULT_CA, SEL.epochEndsAt),
    call(VAULT_CA, SEL.minClip),
  ]);
  const asset = asAddr(assetH) || NVDA_CA;
  const bag = asBig(await call(asset, SEL.balanceOf + word(VAULT_CA.toLowerCase())));
  let clipBal = 0n;
  if (isAddress(who) && isAddress(TOKEN_CA)) {
    clipBal = asBig(await call(TOKEN_CA, SEL.balanceOf + word(who.toLowerCase())));
  }
  return {
    eth: asBig(ethH.result ?? "0x0"),
    bag,
    asset,
    unassigned: asBig(unH),
    epoch: Number(asBig(epH)),
    epochEndsAt: Number(asBig(endsH)) * 1000,
    minClip: asBig(minH),
    clipBal,
  };
}

export function fmtEth(wei: bigint) {
  const n = Number(wei) / 1e18;
  if (!Number.isFinite(n) || n === 0) return "0";
  if (n < 0.0001) return n.toExponential(2);
  return n.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}

export function fmtShares(wei: bigint) {
  const n = Number(wei) / 1e18;
  if (!Number.isFinite(n) || n === 0) return "0";
  if (n < 0.0001) return n.toExponential(2);
  return n.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
}

export async function sendVault(data: string) {
  const { provider, address } = useWallet.getState();
  if (!provider || !address) throw new Error("Connect first.");
  if (!isAddress(VAULT_CA)) throw new Error("Vault not live.");
  await ensureChain(provider);
  const hash = await provider.request({
    method: "eth_sendTransaction",
    params: [{ from: address, to: VAULT_CA, data, value: "0x0" }],
  });
  if (typeof hash !== "string") throw new Error("No hash.");
  await waitReceipt(provider, hash);
  return hash;
}

async function waitReceipt(p: Eip, hash: string) {
  for (let i = 0; i < 40; i++) {
    const r = await p.request({ method: "eth_getTransactionReceipt", params: [hash] });
    if (r && typeof r === "object") {
      const status = (r as { status?: string }).status;
      if (status === "0x0") throw new Error("Reverted.");
      if (status === "0x1") return;
    }
    await new Promise((ok) => setTimeout(ok, 1500));
  }
  throw new Error("Pending. Check the explorer.");
}

export function encodeHarvest() {
  return SEL.harvest;
}
