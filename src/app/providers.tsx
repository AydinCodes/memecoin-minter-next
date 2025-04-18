'use client';

import { WalletContextProvider } from '@/components/wallet/wallet-provider';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return <WalletContextProvider>{children}</WalletContextProvider>;
}