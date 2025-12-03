import { useParams, Link } from 'react-router-dom';
import { useAirdropDetails } from '@/hooks/useAirdropDetails';
import { useClaim } from '@/hooks/useClaim';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from './WalletButton';
import { getAirdropType } from '@/utils/airdrop';
import { formatNumber, formatTokenAmount, truncateAddress } from '@/utils/format';
import { useTokenMetadata } from '@/hooks/useTokenMetadata';
import { SOL_MINT } from '@/constants';

const toNumber = (value?: string | number | null) => Number(value ?? 0) || 0;

export const AirdropDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { publicKey } = useWallet();
  const { details, loading, error } = useAirdropDetails(id || null);
  const { claim, loading: claiming, error: claimError, success } = useClaim();
  const { metadata: tokenMetadata, loading: tokenLoading } = useTokenMetadata(details?.airdrop.mint);

  const tokenSymbol =
    tokenMetadata?.symbol ??
    (tokenLoading ? '...' : details?.airdrop.mint === SOL_MINT ? 'SOL' : 'TOKEN');
  const tokenDecimals = tokenMetadata?.decimals ?? 9;
  const tokenPriceUSD = tokenMetadata?.priceUSD ?? null;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <WalletButton />
        <div className="mt-8 text-center">
          <p className="text-gray-600">Loading airdrop details...</p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <WalletButton />
        <div className="mt-8 text-center">
          <p className="text-red-600">Error: {error || 'Airdrop not found'}</p>
          <Link
            to="/"
            className="mt-4 inline-block text-purple-600 hover:text-purple-700"
          >
            ← Back to Airdrops
          </Link>
        </div>
      </div>
    );
  }

  const { airdrop, userAllocation } = details;
  const type = getAirdropType(airdrop);
  const isVested = type === 'Vested';

  const totalClaim = toNumber(airdrop.maxTotalClaim);
  const totalClaimed = toNumber(airdrop.totalAmountClaimed);
  const claimedPercent = totalClaim ? (totalClaimed / totalClaim) * 100 : 0;

  const unlocked = toNumber(userAllocation?.amountUnlocked);
  const locked = toNumber(userAllocation?.amountLocked);
  const claimed = toNumber(userAllocation?.amountClaimed);
  const totalAllocation = unlocked + locked;
  const availableToClaim = Math.max(unlocked - claimed, 0);

  const allocationDenominator = totalAllocation || 1;
  const unlockedPercent = (unlocked / allocationDenominator) * 100;
  const lockedPercent = (locked / allocationDenominator) * 100;
  const claimedPercentUser = (claimed / allocationDenominator) * 100;

  const toUsd = (amount: number) =>
    tokenPriceUSD ? (amount / Math.pow(10, tokenDecimals)) * tokenPriceUSD : null;

  const totalValueUsd = tokenPriceUSD ? toUsd(totalClaim) : null;
  const fallbackTotalValue = !totalValueUsd && airdrop.totalValue ? toNumber(airdrop.totalValue) : null;
  const displayTotalValue = totalValueUsd ?? fallbackTotalValue;
  const hasTotalValue = displayTotalValue !== null;

  const unlockedUsd = toUsd(unlocked);
  const claimedUsd = toUsd(claimed);
  const lockedUsd = toUsd(locked);
  const totalAllocationUsd = toUsd(totalAllocation);

  const isConnected = Boolean(publicKey);
  const hasUserAllocation = Boolean(userAllocation);
  const canClaim = isConnected && hasUserAllocation && availableToClaim > 0;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <WalletButton />
      <Link
        to="/"
        className="mt-4 inline-block text-purple-600 hover:text-purple-700"
      >
        ← Back to Airdrops
      </Link>

      <div className="mt-8 rounded-3xl bg-white/95 border border-purple-100 p-6 md:p-8 shadow-xl shadow-purple-500/10">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-purple-500 font-semibold">
              Airdrop details
            </p>
            <h1 className="text-3xl font-extrabold text-gray-900">{airdrop.name}</h1>
            <p className="text-sm text-gray-500 font-mono">
              {truncateAddress(airdrop.address)}
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
              type === 'Vested'
                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            }`}
          >
            {type}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
            <h3 className="text-sm font-semibold text-gray-700">Overview</h3>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Recipients</span>
              <span className="font-semibold text-gray-900">
                {airdrop.numNodesClaimed} / {airdrop.maxNumNodes}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Token Amount</span>
              <span className="font-semibold text-gray-900">
                {formatTokenAmount(airdrop.totalAmountClaimed, tokenDecimals)} /{' '}
                {formatTokenAmount(airdrop.maxTotalClaim, tokenDecimals)} {tokenSymbol}
              </span>
            </div>
            {hasTotalValue && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total Value</span>
                <span className="font-semibold text-gray-900">
                  ≈${formatNumber(displayTotalValue ?? 0)}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
            <h3 className="text-sm font-semibold text-gray-700">Schedule</h3>
            {isVested ? (
              <>
                <div className="text-sm text-gray-700">
                  <p>
                    {new Date(airdrop.startVestingTs * 1000).toLocaleDateString()} -{' '}
                    {new Date(airdrop.endVestingTs * 1000).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Unlock period: {airdrop.unlockPeriod} seconds
                  </p>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Unlocked / Locked</span>
                  <span className="font-semibold text-gray-900">
                    {formatTokenAmount(airdrop.totalAmountUnlocked, tokenDecimals)} /{' '}
                    {formatTokenAmount(airdrop.totalAmountLocked, tokenDecimals)} {tokenSymbol}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-700">
                All tokens are immediately available for claim.
              </p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Claim Progress</span>
            <span className="font-semibold text-gray-800">{claimedPercent.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 h-3 rounded-full transition-all"
              style={{ width: `${Math.min(claimedPercent, 100)}%` }}
            />
          </div>
        </div>

        {isConnected && hasUserAllocation && (
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Allocation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-purple-700 font-semibold">
                  <span>Total</span>
                </div>
                <p className="text-xl font-semibold text-gray-900">
                  {formatTokenAmount(totalAllocation, tokenDecimals)} {tokenSymbol}
                </p>
                {totalAllocationUsd !== null && (
                  <p className="text-xs text-gray-500">≈ ${formatNumber(totalAllocationUsd)}</p>
                )}
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-amber-700 font-semibold">
                  <span>Unlocked</span>
                  <span>{unlockedPercent.toFixed(0)}%</span>
                </div>
                <p className="text-xl font-semibold text-amber-900">
                  {formatTokenAmount(String(unlocked), tokenDecimals)} {tokenSymbol}
                </p>
                {unlockedUsd !== null && (
                  <p className="text-xs text-gray-500">≈ ${formatNumber(unlockedUsd)}</p>
                )}
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-600 font-semibold">
                  <span>Claimed</span>
                  <span>{claimedPercentUser.toFixed(0)}%</span>
                </div>
                <p className="text-xl font-semibold text-gray-900">
                  {formatTokenAmount(claimed.toString(), tokenDecimals)} {tokenSymbol}
                </p>
                {claimedUsd !== null && (
                  <p className="text-xs text-gray-500">≈ ${formatNumber(claimedUsd)}</p>
                )}
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-indigo-600 font-semibold">
                  <span>Locked</span>
                  <span>{lockedPercent.toFixed(0)}%</span>
                </div>
                <p className="text-xl font-semibold text-indigo-900">
                  {formatTokenAmount(locked.toString(), tokenDecimals)} {tokenSymbol}
                </p>
                {lockedUsd !== null && (
                  <p className="text-xs text-gray-500">≈ ${formatNumber(lockedUsd)}</p>
                )}
              </div>
            </div>

            {canClaim && (
              <div className="mt-4">
                <button
                  onClick={() => claim(details)}
                  disabled={claiming}
                  className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {claiming ? 'Claiming...' : 'Claim Tokens'}
                </button>
                {claimError && (
                  <p className="mt-2 text-sm text-red-600">{claimError}</p>
                )}
                {success && (
                  <p className="mt-2 text-sm text-green-600">
                    Successfully claimed tokens!
                  </p>
                )}
              </div>
            )}

            {!canClaim && availableToClaim === 0 && (
              <p className="text-sm text-gray-600 mt-2">
                You have no claimable tokens for this airdrop.
              </p>
            )}
          </div>
        )}

        {isConnected && !hasUserAllocation && (
          <div className="border-t border-gray-200 pt-6 mt-6 text-center">
            <p className="text-gray-600">
              You are not eligible for this airdrop
            </p>
          </div>
        )}

        {!isConnected && (
          <div className="border-t border-gray-200 pt-6 mt-6 text-center">
            <p className="text-gray-600">
              Connect your wallet to check your eligibility
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
