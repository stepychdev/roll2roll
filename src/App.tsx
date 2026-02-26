import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { JackpotProvider } from './contexts/JackpotContext';
import { NETWORK as SOLANA_NETWORK } from './lib/constants';
import { Home } from './pages/Home';
import { HowItWorks } from './pages/HowItWorks';
import { Fairness } from './pages/Fairness';
import History from './pages/History';
import RoundDetail from './pages/RoundDetail';
import { Cabinet } from './pages/Cabinet';
import { PlayerProfile } from './pages/PlayerProfile';

import '@solana/wallet-adapter-react-ui/styles.css';

// Cloudflare Worker proxy (preferred — supports both HTTP and WebSocket).
// Falls back to Vercel serverless proxy (HTTP only) in production mainnet,
// or VITE_RPC_URL / public endpoint for local dev.
const CF_PROXY = (import.meta.env.VITE_RPC_PROXY_URL as string | undefined)?.trim();

const RPC_ENDPOINT =
  CF_PROXY ||
  (import.meta.env.PROD && SOLANA_NETWORK === 'mainnet' && typeof window !== 'undefined'
    ? `${window.location.origin}/api/solana-rpc`
    : ((import.meta.env.VITE_RPC_URL as string | undefined)?.trim() ||
       clusterApiUrl(SOLANA_NETWORK === 'mainnet' ? 'mainnet-beta' : 'devnet')));

// Derive WS endpoint from RPC URL (https→wss, http→ws)
const WS_ENDPOINT = RPC_ENDPOINT.replace(/^http/, 'ws');

function PageRouter() {
  const { page } = useNavigation();
  switch (page) {
    case 'how-it-works': return <HowItWorks />;
    case 'fairness': return <Fairness />;
    case 'history': return <History />;
    case 'round-detail': return <RoundDetail />;
    case 'cabinet': return <Cabinet />;
    case 'player-profile': return <PlayerProfile />;
    default: return <Home />;
  }
}

function App() {
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], []);

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT} config={{ wsEndpoint: WS_ENDPOINT, commitment: 'confirmed' }}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <ThemeProvider>
            <NavigationProvider>
              <JackpotProvider>
                <PageRouter />
              </JackpotProvider>
            </NavigationProvider>
          </ThemeProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export { App };
