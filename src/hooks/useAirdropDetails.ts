import { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { fetchAirdropById, checkEligibility } from '@/services/api';
import type { AirdropDetails, ClaimableAirdrop, UseAirdropDetailsReturn } from '@/types';

const normalizeAllocation = (allocation: ClaimableAirdrop): ClaimableAirdrop => ({
  ...allocation,
  amountUnlocked: String(allocation.amountUnlocked ?? '0'),
  amountLocked: String(allocation.amountLocked ?? '0'),
  amountClaimed: String(allocation.amountClaimed ?? '0'),
});

export const useAirdropDetails = (airdropId: string | null): UseAirdropDetailsReturn => {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toString() ?? null;
  const [details, setDetails] = useState<AirdropDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      if (!airdropId) {
        setDetails(null);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const airdrop = await fetchAirdropById(airdropId);
        if (signal?.aborted) return;

        if (!airdrop) {
          setDetails(null);
          setError('Airdrop not found');
          return;
        }

        let userAllocation: ClaimableAirdrop | undefined;

        if (walletAddress) {
          const eligibleAirdrops = await checkEligibility([walletAddress]);
          if (signal?.aborted) return;

          const allocation = eligibleAirdrops.find(
            (item) => item.distributorAddress === airdropId
          );

          if (allocation) {
            userAllocation = normalizeAllocation(allocation);
          }
        }

        setDetails({ airdrop, userAllocation });
      } catch (err) {
        if (signal?.aborted) return;
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch airdrop details';
        setError(errorMessage);
        setDetails(null);
        console.error('Error fetching airdrop details:', err);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [airdropId, walletAddress]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  return {
    details,
    loading,
    error,
    refetch: () => fetchData(),
  };
};
