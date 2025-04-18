'use client';

import { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const WalletButton: FC = () => {
  const { publicKey } = useWallet();
  
  return (
    <div className="wallet-button">
      <WalletMultiButton className="btn bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium py-2 px-4 rounded-full hover:shadow-lg transition-all" />
    </div>
  );
};