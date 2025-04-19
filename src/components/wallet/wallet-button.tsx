'use client';

import { FC, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import '@/styles/wallet-button.css';

// Dynamically import the WalletMultiButton with ssr disabled
// This prevents hydration errors by only rendering on the client
const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

const WalletButton: FC = () => {
  const { publicKey, connected, connecting, disconnecting } = useWallet();
  const [mounted, setMounted] = useState(false);
  
  // Format public key for display
  const getFormattedAddress = () => {
    if (!publicKey) return '';
    const address = publicKey.toString();
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Only show the component after mounting to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

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
  
  if (!mounted) {
    // Return a placeholder with the same dimensions to prevent layout shift
    return <div className="wallet-button-placeholder h-10 w-32"></div>;
  }
  
  return (
    <div className="wallet-button">
      <WalletMultiButton className="wallet-display hover:bg-opacity-90 transition-all" />
    </div>
  );
};

export default WalletButton;