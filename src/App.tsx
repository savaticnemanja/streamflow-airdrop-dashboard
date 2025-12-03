import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { Adapter } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { AirdropList } from '@/components/AirdropList';
import { AirdropDetails } from '@/components/AirdropDetails';
import { AirdropLookup } from '@/components/AirdropLookup';
import '@solana/wallet-adapter-react-ui/styles.css';
import { RPC_ENDPOINT } from '@/constants';

function App() {
  const wallets: Adapter[] = [];

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/" element={<AirdropList />} />
                <Route path="/lookup" element={<AirdropLookup />} />
                <Route path="/airdrop/:id" element={<AirdropDetails />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </BrowserRouter>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
