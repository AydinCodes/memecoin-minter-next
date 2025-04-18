'use client';

import { FC, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@/styles/wallet-button.css';

export const WalletButton: FC = () => {
  const { publicKey, connected, connecting, disconnecting } = useWallet();
  
  // Format public key for display
  const getFormattedAddress = () => {
    if (!publicKey) return '';
    const address = publicKey.toString();
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Add some logging for debugging connection issues
  useEffect(() => {
    if (connecting) {
      console.log('Wallet connecting...');
    } else if (disconnecting) {
      console.log('Wallet disconnecting...');
    } else if (connected) {
      console.log('Wallet connected:', getFormattedAddress());
    }
  }, [connecting, disconnecting, connected, publicKey]);
  
  return (
    <div className="wallet-button">
      <WalletMultiButton className="wallet-display hover:bg-opacity-90 transition-all" />
    </div>
  );
};

export default WalletButton;