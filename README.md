# ClipStock

Trade ETH. The desk clips the tape. Holders take the shares.

- Token: ClipStock `$CLIP`
- Ticker: `$CLIP`
- Site: [clipstock.xyz](https://clipstock.xyz)
- X: [@clipstockXYZ](https://x.com/clipstockXYZ)
- Chain: Robinhood (4663)
- Pad: [Pons V2](https://www.ponsfamily.com/create)

Pons holder sharing stays **off**. Pair is **ETH**. Creator tax **5%** to `ClipVault`. The vault `harvest()`s Pons escrow, `clip()`s a listed Robinhood stock (default NVDA; SPY AAPL TSLA MSFT META PLTR COIN GOOGL AMZN RBLX), and pays holders every 15 minutes.

Contract: [`contracts/ClipVault.sol`](contracts/ClipVault.sol) live at [`0x0ECb3e71DBA0e084499E8E5e3F33587a2fabE5ec`](https://robinhoodchain.blockscout.com/address/0x0ECb3e71DBA0e084499E8E5e3F33587a2fabE5ec)
