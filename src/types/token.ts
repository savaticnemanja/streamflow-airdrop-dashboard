export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  image?: string;
  uri?: string;
  mint: string;
  priceUSD?: number | null;
}
