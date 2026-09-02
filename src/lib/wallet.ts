import { create } from "zustand";
import { CHAIN_ID } from "./catalog";

export const RH_HEX = "0x" + CHAIN_ID.toString(16);
export const RH_RPC = "https://rpc.mainnet.chain.robinhood.com";
export const RH_EXPLORER = "https://robinhoodchain.blockscout.com";

export type Eip = {
  request: (a: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (e: string, fn: (...a: unknown[]) => void) => void;
  removeListener?: (e: string, fn: (...a: unknown[]) => void) => void;
};

export type Discovered = {
  uuid: string;
  name: string;
  icon: string;
  provider: Eip;
};

type State = {
  address: string;
  chainId: number | null;
  error: string;
  wallets: Discovered[];
  open: boolean;
  provider: Eip | null;
  setOpen: (v: boolean) => void;
  listen: () => () => void;
  connect: (w?: Discovered) => Promise<void>;
  disconnect: () => void;
};

function hexToInt(v: unknown) {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseInt(v, 16);
  return null;
}

export function shortAddr(a: string) {
  if (!a || a.length < 12) return a;
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export async function ensureChain(p: Eip) {
  try {
    await p.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: RH_HEX }],
    });
  } catch (e: unknown) {
    const code = (e as { code?: number }).code;
    if (code === 4902 || code === -32603) {
      await p.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: RH_HEX,
            chainName: "Robinhood",
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: [RH_RPC],
            blockExplorerUrls: [RH_EXPLORER],
          },
        ],
      });
    } else {
      throw e;
    }
  }
}

export const useWallet = create<State>((set, get) => ({
  address: "",
  chainId: null,
  error: "",
  wallets: [],
  open: false,
  provider: null,
  setOpen: (v) => set({ open: v }),

  listen: () => {
    if (typeof window === "undefined") return () => {};
    const found = new Map<string, Discovered>();
    const onAnnounce = (ev: Event) => {
      const d = (ev as CustomEvent).detail;
      if (!d?.info?.uuid || !d.provider) return;
      found.set(d.info.uuid, {
        uuid: d.info.uuid,
        name: d.info.name,
        icon: d.info.icon,
        provider: d.provider,
      });
      set({ wallets: [...found.values()] });
    };
    window.addEventListener("eip6963:announceProvider", onAnnounce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    const inj = (window as unknown as { ethereum?: Eip }).ethereum;
    if (inj && found.size === 0) {
      found.set("injected", { uuid: "injected", name: "Browser wallet", icon: "", provider: inj });
      set({ wallets: [...found.values()] });
    }
    return () => window.removeEventListener("eip6963:announceProvider", onAnnounce);
  },

  connect: async (w) => {
    set({ error: "" });
    const p = w?.provider ?? (window as unknown as { ethereum?: Eip }).ethereum;
    if (!p) {
      set({ error: "No wallet in this browser." });
      return;
    }
    try {
      const acc = (await p.request({ method: "eth_requestAccounts" })) as string[];
      await ensureChain(p);
      const cid = hexToInt(await p.request({ method: "eth_chainId" }));
      set({ address: acc[0] ?? "", chainId: cid, open: false, provider: p });
      p.on?.("accountsChanged", (a: unknown) => {
        const list = a as string[];
        set({ address: list?.[0] ?? "", provider: list?.[0] ? p : null });
      });
      p.on?.("chainChanged", (c: unknown) => set({ chainId: hexToInt(c) }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "rejected";
      set({ error: msg });
    }
  },

  disconnect: () => {
    set({ address: "", chainId: null, open: false, error: "", provider: null });
    get();
  },
}));
