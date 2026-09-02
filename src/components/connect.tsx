import { useEffect } from "react";
import { shortAddr, useWallet } from "@/lib/wallet";

export function Connect() {
  const address = useWallet((s) => s.address);
  const open = useWallet((s) => s.open);
  const wallets = useWallet((s) => s.wallets);
  const error = useWallet((s) => s.error);
  const listen = useWallet((s) => s.listen);
  const connect = useWallet((s) => s.connect);
  const disconnect = useWallet((s) => s.disconnect);
  const setOpen = useWallet((s) => s.setOpen);

  useEffect(() => listen(), [listen]);

  if (address) {
    return (
      <button
        type="button"
        onClick={disconnect}
        className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-bg"
        title="Disconnect"
      >
        {shortAddr(address)}
      </button>
    );
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-forest-fg">
        Connect
      </button>
      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-64 rounded-2xl border border-line bg-paper p-3 text-ink shadow-lg">
          <p className="px-2 pb-2 text-xs text-mute">Robinhood 4663</p>
          {wallets.length === 0 ? (
            <button type="button" className="w-full rounded-xl bg-bg px-3 py-3 text-left text-sm" onClick={() => connect()}>
              Browser wallet
            </button>
          ) : (
            wallets.map((w) => (
              <button
                key={w.uuid}
                type="button"
                onClick={() => connect(w)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm hover:bg-bg"
              >
                {w.icon ? <img src={w.icon} alt="" className="size-6 rounded-md" /> : null}
                {w.name}
              </button>
            ))
          )}
          {error ? <p className="mt-2 px-2 text-xs text-forest">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
