# `accountsChanged` Bug Repro

Solana's [`WalletConnectProvider`](https://github.com/reown-com/appkit/blob/2af6ac0dbd6bb2a216c02ea004e39979e652760d/packages/adapters/solana/src/providers/WalletConnectProvider.ts#L26)
is not emitting `accountsChanged` events, so the Solana's [`ChainAdapter`](https://github.com/reown-com/appkit/blob/2af6ac0dbd6bb2a216c02ea004e39979e652760d/packages/adapters/solana/src/client.ts#L60)
cannot update the current account with its
[`accountsChangedHandler`](https://github.com/reown-com/appkit/blob/2af6ac0dbd6bb2a216c02ea004e39979e652760d/packages/adapters/solana/src/client.ts#L579).

Run it and follow the instructions on the page to reproduce the bug.

See it running on https://stackblitz.com/~/github.com/gcangussu/wallet-connect-provider-missing-events

Or run it locally:

```bash
pnpm install && pnpm run dev
```

It runs by default on http://localhost:5173/.
