// src/components/wallet/wallet-provider-client.tsx

'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { LedgerWalletAdapter } from '@solana/wallet-adapter-ledger';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { SOLANA_NETWORK } from '@/config';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

interface ClientWalletProviderProps {
  children: ReactNode;
}

export function ClientWalletProvider({ children }: ClientWalletProviderProps) {
  // Track component mounting state to prevent hydration issues
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Set the network from environment variables
  const networkEnv = SOLANA_NETWORK || 'devnet';
  const network = networkEnv === 'mainnet-beta' 
    ? WalletAdapterNetwork.Mainnet
    : WalletAdapterNetwork.Devnet;

  // Set up the RPC endpoint - always use public endpoints on client side
  const endpoint = useMemo(() => {
    // Debug log network configuration (will be visible in browser console)
    console.log(`Initializing wallet provider for network: ${networkEnv}`);
    
    // Always use public endpoints for client-side
    console.log(`Using public ${networkEnv} RPC endpoint in ConnectionProvider`);
    return clusterApiUrl(network);
  }, [network, networkEnv]);

  // Make sure PhantomWalletAdapter is first in the list to prioritize it
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new LedgerWalletAdapter()
    ],
    [network]
  );

  // Only render the provider once the component is mounted to avoid hydration errors
  if (!mounted) return null;

  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: 'confirmed' }}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}