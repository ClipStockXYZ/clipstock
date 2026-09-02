# ClipVault

Remix · Solidity 0.8.24 · optimizer on · Robinhood Chain 4663.

Constructor: `keeper` = crank EOA.

```
harvest()             // anyone — pulls Pons FeeEscrow into this vault
clip(minOut)          // keeper — wrap ETH, buy NVDA
settleEpoch(root, w)  // keeper — 15m merkle of $CLIP holders
claim(e, weight, proof)
setClipToken($CLIP)   // owner — after Pons mints
```

Pons V2: holder sharing **off**, pair **ETH**, creator tax **5**, creator wallet = this contract.

NVDA `0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC`
WETH `0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73`
SwapRouter02 `0xcaf681a66d020601342297493863e78c959e5cb2`
FeeEscrow `0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e`
