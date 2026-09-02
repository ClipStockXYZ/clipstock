export const TOKEN_NAME = "ClipStock";
export const TOKEN_TICKER = "CLIP";
export const SITE_HOST = "clipstock.xyz";
export const SITE_URL = "https://clipstock.xyz";
export const GH_URL = "https://github.com/ClipStockXYZ/clipstock";
export const TG_URL = "https://t.me/ClipStock";
export const X_URL = "https://x.com/clipstockXYZ";
export const PONS_URL = "https://www.ponsfamily.com/create";
export const PONS_DOCS = "https://docs.ponsfamily.com/v2";
export const CHAIN_ID = 4663;
export const CHAIN_NAME = "Robinhood Chain";
export const EXPLORER_URL = "https://robinhoodchain.blockscout.com";

export const TOKEN_CA = "";
export const VAULT_CA = "0x0ECb3e71DBA0e084499E8E5e3F33587a2fabE5ec";

export const NVDA_CA = "0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC";
export const WETH_CA = "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73";
export const ESCROW_CA = "0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e";
export const ROUTER_CA = "0xcaf681a66d020601342297493863e78c959e5cb2";

export const CREATOR_TAX = 5;
export const EPOCH_MS = 15 * 60 * 1000;
export const MIN_CLIP_ETH = 0.02;

export const LINE = "Trade ETH. The desk clips the tape. Holders take the shares.";

/** Native Robinhood stock tokens the vault may clip. Default clipAsset = NVDA. */
export const TAPE = [
  { ticker: "NVDA", name: "NVIDIA", ca: NVDA_CA },
  { ticker: "SPY", name: "S&P 500", ca: "0x117cc2133c37B721F49dE2A7a74833232B3B4C0C" },
  { ticker: "AAPL", name: "Apple", ca: "0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9" },
  { ticker: "TSLA", name: "Tesla", ca: "0x322F0929c4625eD5bAd873c95208D54E1c003b2d" },
  { ticker: "MSFT", name: "Microsoft", ca: "0xe93237C50D904957Cf27E7B1133b510C669c2e74" },
  { ticker: "META", name: "Meta", ca: "0xc0D6457C16Cc70d6790Dd43521C899C87ce02f35" },
  { ticker: "PLTR", name: "Palantir", ca: "0x894E1EC2D74FFE5AEF8Dc8A9e84686acCB964F2A" },
  { ticker: "COIN", name: "Coinbase", ca: "0x6330D8C3178a418788dF01a47479c0ce7CCF450b" },
  { ticker: "GOOGL", name: "Alphabet", ca: "0x2e0847E8910a9732eB3fb1bb4b70a580ADAD4FE3" },
  { ticker: "AMZN", name: "Amazon", ca: "0x12f190a9F9d7D37a250758b26824B97CE941bF54" },
  { ticker: "RBLX", name: "Roblox", ca: "0xF0C4BF4C582cb3836e98394b1d4e7B7281101bE8" },
] as const;

export function tickerOf(ca: string) {
  const t = TAPE.find((s) => s.ca.toLowerCase() === ca.toLowerCase());
  return t?.ticker ?? "NVDA";
}

export function isAddress(v: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(v.trim());
}

export function shortCa(ca: string) {
  const t = ca.trim();
  if (!isAddress(t)) return "";
  return `${t.slice(0, 6)}…${t.slice(-4)}`;
}

export function fmtUsd(n: number) {
  if (!Number.isFinite(n) || n <= 0) return "";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}b`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}m`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}k`;
  return `$${n.toFixed(0)}`;
}
