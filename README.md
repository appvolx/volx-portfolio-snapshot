# volx-portfolio-snapshot

**VOLX Ecosystem Tool** — Local wallet portfolio snapshot via public RPC.

Part of the [VOLX](https://volx.app) tooling suite.  
GitHub org: [https://github.com/appvolx](https://github.com/appvolx)

## What it does

`volx-portfolio-snapshot` queries a **public Solana RPC** for:

- SOL balance (lamports → SOL)
- SPL token accounts owned by a wallet (`getTokenAccountsByOwner`)
- Basic mint decimals / amount formatting when available

It produces a JSON or human-readable snapshot suitable for scripts, audits, or comparing against the VOLX `/portfolio` UI.

**Fully non-custodial and local.** No private keys. No signing. No third-party portfolio APIs required (only public RPC).

## Why it exists

VOLX shows portfolio positions (LP, farms, tokens). Integrators and power users often want a CLI snapshot that does not depend on the Next.js app or Supabase. This tool provides that baseline using only public RPC methods.

## Features

- Node.js ≥ 18, TypeScript source
- Pure `fetch` JSON-RPC (no heavy SDK required)
- JSON and table output
- Configurable RPC endpoint

## Requirements

- Node.js ≥ 18
- Network access to a Solana RPC

## Installation

```bash
cd volx-portfolio-snapshot
npm install
npx tsx src/snapshot.ts --owner <WALLET>
```

## Quick start

```bash
# SOL + token accounts
npx tsx src/snapshot.ts --owner <BASE58_WALLET>

# Custom RPC
npx tsx src/snapshot.ts --owner <WALLET> --rpc https://api.mainnet-beta.solana.com

# JSON only
npx tsx src/snapshot.ts --owner <WALLET> --json
```

## Security model

- Read-only RPC
- Wallet address is a public key only
- Never prompts for seed phrases or private keys
- Safe for public GitHub repositories

## Integration with VOLX

Complements the portfolio and points surfaces. Use this to verify raw on-chain balances before / after using VOLX LP and farm features.

## License

MIT — complementary tooling for the VOLX project (https://volx.app).
