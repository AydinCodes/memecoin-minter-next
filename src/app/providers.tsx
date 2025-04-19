'use client';

import { ReactNode, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Create a client-only wrapper component
const WalletConnectionProvider = ({ children }: { children: ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return <>{children}</>;
};

// Dynamically import the wallet components with ssr: false
const ClientWalletProvider = dynamic(
  () => import('../components/wallet/wallet-provider-client').then(module => module.ClientWalletProvider),
  {
    ssr: false,
    loading: () => <WalletConnectionProvider><div>{/* Loading placeholder */}</div></WalletConnectionProvider>
  }
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClientWalletProvider>
      {children}
    </ClientWalletProvider>
  );
}