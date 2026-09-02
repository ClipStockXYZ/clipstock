export const TOKEN_NAME = "ClipStock";
export const TOKEN_TICKER = "CLIP";
export const SITE_HOST = "clipstock.xyz";
export const SITE_URL = "https://clipstock.xyz";
export const GH_URL = "https://github.com/ClipStockXYZ/clipstock";
export const TG_URL = "https://t.me/ClipStock";
export const X_URL = "";
export const PONS_URL = "https://www.ponsfamily.com/create";
export const PONS_DOCS = "https://docs.ponsfamily.com/v2";
export const CHAIN_ID = 4663;
export const CHAIN_NAME = "Robinhood Chain";
export const EXPLORER_URL = "https://robinhoodchain.blockscout.com";

export const TOKEN_CA = "";
export const VAULT_CA = "";

export const NVDA_CA = "0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC";
export const WETH_CA = "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73";
export const ESCROW_CA = "0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e";
export const ROUTER_CA = "0xcaf681a66d020601342297493863e78c959e5cb2";

export const CREATOR_TAX = 5;
export const EPOCH_MS = 15 * 60 * 1000;
export const MIN_CLIP_ETH = 0.02;

export const LINE = "Trade ETH. The desk clips NVDA. Holders take the shares.";

export function isAddress(v: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(v.trim());
}

export function shortCa(ca: string) {
  const t = ca.trim();
  if (!isAddress(t)) return "";
  return `${t.slice(0, 6)}…${t.slice(-4)}`;
}
