import type { Airdrop, ClaimableAirdrop } from './airdrop';

export interface AirdropCardProps {
  airdrop: Airdrop;
  claimable?: ClaimableAirdrop;
}
