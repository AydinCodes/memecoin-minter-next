'use client';

import { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const WalletButton: FC = () => {
  const { publicKey } = useWallet();
  
  return (
    <div className="wallet-button">
      <WalletMultiButton className="wallet-display hover:bg-opacity-90 transition-all" />
    </div>
  );
};