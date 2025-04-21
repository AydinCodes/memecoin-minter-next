'use client';

import { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { formatWalletAddress, getWalletBalance, isWalletConnected, saveWalletPublicKey } from '@/services/wallet-service';
import { debugWallet, debugWalletCapabilities } from '@/utils/wallet-debug';
import '@/styles/wallet-button.css';

export default function WalletButton() {
  const { publicKey, connected, connecting, disconnecting, wallet } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  
  // Load balance when connected
  const loadBalance = useCallback(async () => {
    if (connected && publicKey) {
      try {
        const sol = await getWalletBalance(publicKey);
        setBalance(sol);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    } else {
      setBalance(null);
    }
  }, [connected, publicKey]);

  // Only show the component after mounting to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch balance when connected
  useEffect(() => {
    if (connected && publicKey) {
      loadBalance();
      
      // Save the public key to localStorage for use in IPFS naming
      saveWalletPublicKey(publicKey.toString());
    }
  }, [connected, publicKey, loadBalance]);

  // Format public key for display
  const getFormattedAddress = () => {
    if (!publicKey) return '';
    return formatWalletAddress(publicKey.toString());
  };

  // Add some logging for debugging connection issues
  useEffect(() => {
    if (connecting) {
      console.log('Wallet connecting...');
    } else if (disconnecting) {
      console.log('Wallet disconnecting...');
    } else if (connected) {
      console.log('Wallet connected:', getFormattedAddress());
      // Add additional debugging
      debugWallet(wallet);
      debugWalletCapabilities(wallet);
    }
  }, [connecting, disconnecting, connected, publicKey, wallet]);
  
  if (!mounted) {
    // Return a placeholder with the same dimensions to prevent layout shift
    return <div className="wallet-button-placeholder h-10 w-32"></div>;
  }
  
  return (
    <div className="wallet-button relative">
      <WalletMultiButton className="wallet-display hover:bg-opacity-90 transition-all" />
      
      {connected && balance !== null && (
        <div className="wallet-balance absolute -bottom-6 right-0 text-xs text-gray-400 bg-[#171717] px-2 py-1 rounded">
          {balance.toFixed(2)} SOL
        </div>
      )}
    </div>
  );
}