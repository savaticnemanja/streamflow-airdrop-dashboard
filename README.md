Streamflow Airdrop Dashboard
============================

Browser-based dashboard for discovering Streamflow airdrops, checking eligibility, and claiming allocations with a connected Solana wallet.

Requirements
------------
- Node.js 18+ (npm included)
- A Solana wallet (e.g., Phantom) for claim flows
- Access to a Solana RPC endpoint (set via env variable)

Getting Started
---------------
1) Install dependencies
   - `npm install`

2) Configure environment
   - Copy `.env.example` to `.env` (if present) or create `.env` with:
     - `VITE_RPC_ENDPOINT` — Solana RPC URL (defaults to devnet if unset)

3) Run the app locally
   - `npm run dev`
   - Open the printed localhost URL in your browser.

4) Production build
   - `npm run build`
   - Preview the build with `npm run preview`

API and Data
------------
- Airdrop data: `https://staging-api.streamflow.finance/v2/api`
- Token metadata: on-chain via Metaplex token metadata program
- Token prices: CoinGecko (requests are cached in-memory to reduce rate limits)

Sources
-------
- Streamflow JS SDK docs: https://js-sdk-docs.streamflow.finance/
- Public API docs: https://api-public.streamflow.finance/v2/docs
- Automated airdrop creation guide: https://streamflow.notion.site/Public-Automated-Airdrop-Creation-45b84bfd2dda4d7196be5dd02eed29c8
