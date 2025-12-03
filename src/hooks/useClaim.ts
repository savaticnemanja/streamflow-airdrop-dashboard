import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { ICluster } from '@streamflow/common';
import { SolanaDistributorClient } from '@streamflow/distributor/solana';
import { fetchClaimant } from '@/services/api';
import type { AirdropDetails, UseClaimReturn } from '@/types';
import BN from 'bn.js';
import type { Adapter, SignerWalletAdapter } from '@solana/wallet-adapter-base';

export const useClaim = (): UseClaimReturn => {
  const { publicKey, sendTransaction, wallet } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const claim = async (details: AirdropDetails) => {
    if (!publicKey || !sendTransaction) {
      setError('Wallet not connected');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { airdrop, userAllocation } = details;

      if (!userAllocation) {
        throw new Error('No allocation found for this airdrop');
      }

      const distributorAddress =
        userAllocation.distributorAddress || airdrop.address;
      const recipientAddress = publicKey.toBase58();

      if (
        userAllocation.address.toLowerCase() !== recipientAddress.toLowerCase()
      ) {
        throw new Error(
          'Wallet address mismatch. Please use the wallet that is eligible for this airdrop.',
        );
      }

      const claimantInfo = await fetchClaimant(
        distributorAddress,
        recipientAddress,
      );

      const amountUnlockedStr =
        claimantInfo.rawAmountUnlocked ??
        claimantInfo.amountUnlocked ??
        userAllocation.amountUnlocked ??
        '0';
      const amountLockedStr =
        claimantInfo.rawAmountLocked ??
        claimantInfo.amountLocked ??
        userAllocation.amountLocked ??
        '0';
      const amountClaimedStr =
        claimantInfo.rawAmountClaimed ??
        claimantInfo.amountClaimed ??
        userAllocation.amountClaimed ??
        '0';

      const amountUnlockedNum = Number(amountUnlockedStr);
      const amountClaimedNum = Number(amountClaimedStr);
      const claimableAmount = amountUnlockedNum - amountClaimedNum;

      if (Number.isNaN(claimableAmount) || claimableAmount <= 0) {
        throw new Error('No claimable tokens available');
      }

      const endpoint = connection.rpcEndpoint;
      const cluster = endpoint.includes('devnet')
        ? ICluster.Devnet
        : endpoint.includes('testnet')
          ? ICluster.Testnet
          : ICluster.Mainnet;

      const distributorClient = new SolanaDistributorClient({
        clusterUrl: endpoint,
        cluster,
      });

      const adapter = wallet?.adapter as Adapter | null | undefined;
      const canSign = adapter && 'signTransaction' in adapter;
      if (!adapter || !canSign) {
        throw new Error(
          'Wallet adapter not available or does not support signing',
        );
      }

      let proof: number[][] = [];
      if (
        claimantInfo.proof &&
        Array.isArray(claimantInfo.proof) &&
        claimantInfo.proof.length > 0
      ) {
        proof = claimantInfo.proof.map((p: string | number[]) => {
          if (typeof p === 'string') {
            return Array.from(Buffer.from(p, 'hex'));
          }
          return Array.isArray(p) ? p : [];
        });
      }

      if (proof.length === 0) {
        throw new Error(
          'Merkle proof is required for claiming. Please ensure you are eligible for this airdrop.',
        );
      }

      const result = await distributorClient.claim(
        {
          id: claimantInfo.distributorAddress ?? distributorAddress,
          proof,
          amountUnlocked: new BN(amountUnlockedStr),
          amountLocked: new BN(amountLockedStr),
        },
        { invoker: adapter as SignerWalletAdapter },
      );

      if (result.txId) {
        await connection.confirmTransaction(result.txId, 'confirmed');
      }

      setSuccess(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to claim tokens';
      setError(errorMessage);
      console.error('Error claiming tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    claim,
    loading,
    error,
    success,
  };
};
