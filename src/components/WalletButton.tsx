import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const WalletButton = () => {
  return (
    <div className="flex justify-end">
      <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-indigo-500 hover:!brightness-110 !transition !duration-200 !rounded-xl !px-4 !py-2 !shadow-lg !shadow-purple-500/20" />
    </div>
  );
};
