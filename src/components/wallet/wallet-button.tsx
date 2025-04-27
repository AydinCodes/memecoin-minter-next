'use client';

import { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { formatWalletAddress, getWalletBalance, saveWalletPublicKey } from '@/services/wallet-service';

export default function WalletButton() {
  const { publicKey, connected, connecting, disconnecting, wallet } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceError, setBalanceError] = useState(false);
  
  // Load balance when connected
  const loadBalance = useCallback(async () => {
    if (connected && publicKey) {
      try {
        setBalanceError(false);
        const sol = await getWalletBalance(publicKey);
        
        if (sol === null) {
          setBalanceError(true);
          setBalance(null);
        } else {
          setBalance(sol);
        }
      } catch (error) {
        console.error("Error loading balance:", error);
        setBalanceError(true);
        setBalance(null);
      }
    } else {
      setBalance(null);
      setBalanceError(false);
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

  if (!mounted) {
    // Return a placeholder with the same dimensions to prevent layout shift
    return <div className="wallet-button-placeholder"></div>;
  }
  
  return (
    <div className="wallet-button relative">
      <WalletMultiButton 
        className="wallet-adapter-button-trigger !bg-gradient-to-r from-purple-600 to-blue-500 !rounded-full transition-all hover:shadow-lg" 
      />
      
      {connected && (
        <div className="wallet-balance absolute -bottom-6 right-0 text-xs text-gray-300 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
          {balanceError ? (
            <span title="Network Error">-- SOL</span>
          ) : balance !== null ? (
            `${balance.toFixed(2)} SOL`
          ) : (
            <span className="animate-pulse">Loading...</span>
          )}
        </div>
      )}
    </div>
  );
}