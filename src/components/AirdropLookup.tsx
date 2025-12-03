import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletButton } from './WalletButton';

export const AirdropLookup = () => {
  const [airdropId, setAirdropId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = airdropId.trim();
    if (trimmed) {
      navigate(`/airdrop/${trimmed}`);
    }
  };

  const hasInput = Boolean(airdropId.trim());

  return (
    <div className="max-w-3xl mx-auto p-6">
      <WalletButton />
      <div className="mt-8 rounded-3xl bg-white/95 border border-purple-100 p-8 shadow-lg shadow-purple-500/10">
        <div className="flex flex-col gap-2 mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-purple-500 font-semibold">
            Manual lookup
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Find an Airdrop
          </h1>
          <p className="text-sm text-gray-600">
            Paste a distributor address to view details and eligibility.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="airdrop-id"
              className="block text-sm font-semibold text-gray-800"
            >
              Distributor Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400 text-xs font-mono">
                SOL•
              </div>
              <input
                id="airdrop-id"
                type="text"
                value={airdropId}
                onChange={(e) => setAirdropId(e.target.value)}
                placeholder="Gxv36Kxi2Ud2hiy24dbttLy67oPWfvwBnQ4C5EGs6bmq"
                className="w-full pl-12 pr-4 py-3 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm bg-purple-50/50"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!hasInput}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Lookup Airdrop
          </button>
        </form>
      </div>
    </div>
  );
};
