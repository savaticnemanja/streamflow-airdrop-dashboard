export interface Airdrop {
  csvKey: string;
  merkleRoot: number[];
  chain: string;
  mint: string;
  version: number;
  address: string; // distributor address
  sender: string;
  name: string;
  maxNumNodes: string;
  maxTotalClaim: string;
  totalAmountUnlocked: string;
  totalAmountLocked: string;
  totalAmountClaimed: string;
  numNodesClaimed: string;
  totalClaimablePreUpdate: string;
  totalValue: string;
  totalValueUnlocked: string;
  totalValueLocked: string;
  startVestingTs: number;
  endVestingTs: number;
  unlockPeriod: number;
  claimsLimit: number | null;
  lastDurationUpdateTs: number | null;
  createdDt: string;
  clawbackDt: string | null;
  isAligned: boolean;
  isOnChain: boolean;
  isPopulated: boolean;
  isVerified: boolean;
  isActive: boolean;
}

export interface ClaimableAirdrop {
  chain: string;
  distributorAddress: string;
  address: string; // user address
  amountUnlocked: string;
  amountLocked: string;
  amountClaimed: string;
  isClosed: boolean;
  mint: string;
  claimableValue: string | null;
}

export interface AirdropListResponse {
  limit: number;
  offset: number;
  items: ClaimableAirdrop[];
}

export type AirdropType = 'Vested' | 'Instant';

export interface AirdropDetails {
  airdrop: Airdrop;
  userAllocation?: ClaimableAirdrop;
}
