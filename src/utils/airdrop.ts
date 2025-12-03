import type { Airdrop, AirdropType } from '@/types';

export const getAirdropType = (airdrop: Airdrop): AirdropType => {
  const isInstant =
    airdrop.unlockPeriod === 1 &&
    airdrop.startVestingTs === airdrop.endVestingTs;
  return isInstant ? 'Instant' : 'Vested';
};

export const calculateClaimableAmount = (
  amountUnlocked: string,
  amountClaimed: string,
): string => {
  const unlocked = Number(amountUnlocked) || 0;
  const claimed = Number(amountClaimed) || 0;
  const claimable = Math.max(0, unlocked - claimed);
  return claimable.toString();
};
