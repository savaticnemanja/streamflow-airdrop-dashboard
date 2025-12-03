import { PublicKey } from '@solana/web3.js';

// Metaplex token metadata program ID
export const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// Seeds used to derive metadata PDA
export const METADATA_SEED = new TextEncoder().encode('metadata');

// Wrapped SOL mint
export const SOL_MINT = 'So11111111111111111111111111111111111111112';

// Cache TTLs
export const PRICE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// API defaults
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://staging-api.streamflow.finance/v2/api';

// RPC endpoint defaults
export const RPC_ENDPOINT =
  import.meta.env.VITE_RPC_ENDPOINT || 'https://api.devnet.solana.com';
export const DEFAULT_LIMIT = 100;
export const DEFAULT_CHAIN = 'SOLANA';
