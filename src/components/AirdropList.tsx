import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAirdrops } from '@/hooks/useAirdrops';
import { AirdropCard } from './AirdropCard';
import { WalletButton } from './WalletButton';

const ToggleSwitch = ({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    onClick={onToggle}
    className={`relative h-6 w-11 rounded-full transition ${
      checked ? 'bg-gradient-to-r from-purple-600 to-indigo-500' : 'bg-gray-300'
    }`}
    aria-pressed={checked}
  >
    <span
      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
        checked ? 'right-0.5' : 'left-0.5'
      }`}
    />
  </button>
);

const ShowUnvaluedToggle = ({
  value,
  onToggle,
  className = '',
}: {
  value: boolean;
  onToggle: () => void;
  className?: string;
}) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <span className="text-sm font-semibold text-gray-800">Show unvalued airdrops</span>
    <ToggleSwitch checked={value} onToggle={onToggle} />
  </div>
);

export const AirdropList = () => {
  const { publicKey } = useWallet();
  const isConnected = Boolean(publicKey);
  const [showUnvalued, setShowUnvalued] = useState(false);
  const skimZeroValued = !showUnvalued;
  const { airdrops, claimableAirdrops, loading, error } = useAirdrops({ skimZeroValued });
  const toggleShowUnvalued = () => setShowUnvalued((prev) => !prev);

  const claimableByDistributor = useMemo(() => {
    const map: Record<string, typeof claimableAirdrops[number]> = {};
    claimableAirdrops.forEach((item) => {
      map[item.distributorAddress] = item;
    });
    return map;
  }, [claimableAirdrops]);

  if (!isConnected) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <WalletButton />
        <div className="mt-10 text-center rounded-2xl border border-purple-100 bg-white/80 p-10 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Discover Airdrops</h1>
          <p className="text-gray-600 text-lg mb-6">
            Connect your wallet to see drops tailored to you.
          </p>
          <div className="flex justify-center">
            <Link
              to="/lookup"
              className="inline-flex items-center gap-2 px-4 py-2 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
            >
              Or lookup an airdrop by ID
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <WalletButton />
        <div className="mt-10 text-center rounded-2xl border border-purple-100 bg-white/80 p-10 shadow-sm">
          <p className="text-gray-600 text-lg">Loading airdrops...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <WalletButton />
        <div className="mt-10 text-center rounded-2xl border border-red-100 bg-white/80 p-10 shadow-sm">
          <p className="text-red-600 font-semibold">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (airdrops.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <WalletButton />
        <div className="mt-10 text-center rounded-2xl border border-purple-100 bg-white/80 p-10 shadow-sm">
          <ShowUnvaluedToggle
            value={showUnvalued}
            onToggle={toggleShowUnvalued}
            className="justify-center mb-4"
          />
          <p className="text-gray-700 mb-4 font-semibold">No airdrops found for your wallet</p>
          <div className="flex justify-center">
            <Link
              to="/lookup"
              className="inline-block px-4 py-2 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
            >
              Lookup an airdrop by ID
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 p-[1px] shadow-lg shadow-purple-500/20">
        <div className="rounded-3xl bg-white/95 p-6 md:p-8">
          <WalletButton />
          <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-purple-500 font-semibold">
                Streamflow Airdrops
              </p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">
                Available Airdrops
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Claimable campaigns curated for your connected wallet.
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-3 md:items-end">
              <ShowUnvaluedToggle
                value={showUnvalued}
                onToggle={toggleShowUnvalued}
                className="rounded-xl border border-gray-200 px-3 py-2 bg-gray-50/60"
              />
              <Link
                to="/lookup"
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors"
              >
                Lookup by ID
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {airdrops.map((airdrop) => (
              <AirdropCard
                key={airdrop.address}
                airdrop={airdrop}
                claimable={claimableByDistributor[airdrop.address]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
