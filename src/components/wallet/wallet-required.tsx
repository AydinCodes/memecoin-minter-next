'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface WalletRequiredProps {
  message?: string;
}

export default function WalletRequired({ message = 'Please connect your wallet to continue' }: WalletRequiredProps) {
  const { connected } = useWallet();

  if (connected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="max-w-md mx-auto p-8 bg-[#171717] rounded-xl text-center">
        <div className="w-20 h-20 bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">Wallet Required</h2>
        <p className="text-gray-400 mb-6">
          {message}
        </p>
        
        <div className="flex justify-center">
          <WalletMultiButton className="wallet-button-custom bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium py-3 px-8 rounded-full hover:shadow-lg transition-all" />
        </div>
      </div>
    </div>
  );
}