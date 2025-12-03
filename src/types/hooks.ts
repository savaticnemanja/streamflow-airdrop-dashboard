import type { Airdrop, AirdropDetails, ClaimableAirdrop } from './airdrop';
import type { TokenMetadata } from './token';

export interface UseAirdropsReturn {
  airdrops: Airdrop[];
  claimableAirdrops: ClaimableAirdrop[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseAirdropsOptions {
  skimZeroValued?: boolean;
}

export interface UseAirdropDetailsReturn {
  details: AirdropDetails | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseClaimReturn {
  claim: (details: AirdropDetails) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface UseTokenMetadataReturn {
  metadata: TokenMetadata | null;
  loading: boolean;
  error: string | null;
}
