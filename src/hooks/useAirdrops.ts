import { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { fetchClaimableAirdrops, fetchAirdropsByAddresses } from '@/services/api';
import type { Airdrop, ClaimableAirdrop, UseAirdropsOptions, UseAirdropsReturn } from '@/types';

export const useAirdrops = (options?: UseAirdropsOptions): UseAirdropsReturn => {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toString() ?? null;
  const skimZeroValued = options?.skimZeroValued ?? false;
  const [airdrops, setAirdrops] = useState<Airdrop[]>([]);
  const [claimableAirdrops, setClaimableAirdrops] = useState<ClaimableAirdrop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      if (!walletAddress) {
        setAirdrops([]);
        setClaimableAirdrops([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const claimable = await fetchClaimableAirdrops(walletAddress, undefined, skimZeroValued);
        if (signal?.aborted) return;

        setClaimableAirdrops(claimable);

        const distributorAddresses = claimable.map((item) => item.distributorAddress);

        if (distributorAddresses.length > 0) {
          const airdropDetails = await fetchAirdropsByAddresses(distributorAddresses);
          if (signal?.aborted) return;
          setAirdrops(airdropDetails);
        } else {
          setAirdrops([]);
        }
      } catch (err) {
        if (signal?.aborted) return;
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch airdrops';
        setError(errorMessage);
        setAirdrops([]);
        setClaimableAirdrops([]);
        console.error('Error fetching airdrops:', err);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [walletAddress, skimZeroValued]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  return {
    airdrops,
    claimableAirdrops,
    loading,
    error,
    refetch: () => fetchData(),
  };
};
