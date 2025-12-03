import { Link } from 'react-router-dom';
import type { AirdropCardProps } from '@/types';
import { getAirdropType, calculateClaimableAmount } from '@/utils/airdrop';
import { formatNumber, formatTokenAmount } from '@/utils/format';
import { useTokenMetadata } from '@/hooks/useTokenMetadata';

const toNumber = (value?: string | null) => parseFloat(value ?? '0') || 0;

export const AirdropCard = ({ airdrop, claimable }: AirdropCardProps) => {
  const { metadata: tokenMetadata, loading: tokenLoading } = useTokenMetadata(airdrop.mint);

  const tokenDecimals = tokenMetadata?.decimals ?? 9;
  const tokenPriceUSD = tokenMetadata?.priceUSD ?? null;
  const tokenSymbol = tokenMetadata?.symbol ?? (tokenLoading ? '...' : 'TOKEN');

  const totalClaim = toNumber(airdrop.maxTotalClaim);
  const totalClaimed = toNumber(airdrop.totalAmountClaimed);
  const claimedPercent = totalClaim ? (totalClaimed / totalClaim) * 100 : 0;

  const totalAllocation = claimable
    ? toNumber(claimable.amountUnlocked) + toNumber(claimable.amountLocked)
    : 0;
  const availableToClaim = claimable
    ? toNumber(calculateClaimableAmount(claimable.amountUnlocked, claimable.amountClaimed))
    : 0;

  const totalValueUSD = tokenPriceUSD
    ? (totalClaim / Math.pow(10, tokenDecimals)) * tokenPriceUSD
    : null;
  const fallbackTotalValue =
    !totalValueUSD && airdrop.totalValue ? toNumber(airdrop.totalValue) : null;
  const displayValue = totalValueUSD ?? fallbackTotalValue;
  const hasDisplayValue = displayValue !== null;
  const hasClaimable = Boolean(claimable);
  const type = getAirdropType(airdrop);

  return (
    <Link
      to={`/airdrop/${airdrop.address}`}
      className="group relative block rounded-2xl border border-transparent bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-[1px] shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="rounded-2xl bg-white/90 p-6 backdrop-blur">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 transition-colors group-hover:text-purple-700">
              {airdrop.name}
            </h3>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              {airdrop.address}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
              type === 'Vested'
                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            }`}
          >
            {type}
          </span>
        </div>

        <div className="space-y-3">
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
          {hasClaimable && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Total Allocation</span>
              <span className="font-semibold text-gray-900">
                {formatTokenAmount(totalAllocation.toString(), tokenDecimals)} {tokenSymbol}
              </span>
            </div>
          )}
          {hasClaimable && (
            <div className="flex justify-between text-sm text-purple-700 bg-purple-50/60 border border-purple-100 rounded-xl px-3 py-2">
              <span className="font-semibold">Available to claim</span>
              <span className="font-semibold">
                {formatTokenAmount(availableToClaim.toString(), tokenDecimals)} {tokenSymbol}
              </span>
            </div>
          )}
          {hasDisplayValue && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Value</span>
              <span className="font-semibold text-gray-900">
                ${formatNumber(displayValue ?? 0)}
              </span>
            </div>
          )}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Progress</span>
              <span className="font-semibold text-gray-800">
                {claimedPercent.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 transition-all"
                style={{ width: `${Math.min(claimedPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
