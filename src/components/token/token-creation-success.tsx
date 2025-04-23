'use client';

import Link from 'next/link';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CheckmarkAnimation from '../ui/checkmark-animation';
import CopyButton from '../ui/copy-button';
import '../../styles/checkmark.css';

interface TokenCreationSuccessProps {
  result: {
    mintAddress: string;
    metadataUrl: string;
    imageUrl: string;
    explorerUrl: string;
  };
}

export default function TokenCreationSuccess({ result }: TokenCreationSuccessProps) {
  const router = useRouter();

  // Ensure we're at the top of the page when this component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Function to handle creating another token
  const handleCreateAnother = () => {
    // Force a hard navigation to reset the page
    window.location.href = '/create-token';
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="bg-[#171717] rounded-xl p-8 shadow-lg border border-purple-500/30 border-opacity-30">
        <div className="text-center mb-8">
          <CheckmarkAnimation />
          
          <h1 className="text-3xl font-bold text-white mb-2">Token Created Successfully!</h1>
          <p className="text-gray-400 text-lg">Your Solana token has been created and is ready to use.</p>
        </div>
        
        <div className="token-info bg-[#222] rounded-lg p-5 mb-8">
          <div className="flex items-center justify-center mb-6">
            <img 
              src={result.imageUrl} 
              alt="Token Logo" 
              className="w-24 h-24 rounded-full border-4 border-gray-700"
            />
          </div>
          
          <div className="mb-6 relative">
            <div className="text-gray-500 text-sm flex items-center justify-between">
              <span>Token Address</span>
              <CopyButton textToCopy={result.mintAddress} />
            </div>
            <div className="font-mono text-white text-sm bg-[#333] p-3 rounded mt-1 overflow-x-auto">
              {result.mintAddress}
            </div>
            <div className="flex justify-end mt-2">
              <a 
                href={result.explorerUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 text-sm hover:text-purple-300 flex items-center"
              >
                View on Explorer
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="next-steps space-y-4 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Next Steps</h2>
          
          <div className="step bg-[#222] p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-2">Create Liquidity</h3>
            <p className="text-gray-400 mb-2">Create a liquidity pool on a DEX like Raydium to make your token tradable.</p>
            <a 
              href="https://raydium.io/liquidity/create-pool" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-500 hover:text-purple-400 inline-flex items-center"
            >
              Go to Raydium
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
            </a>
          </div>
        </div>
        
        <div className="buttons flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
          <Link 
            href="/my-tokens"
            className="btn bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium py-3 px-8 rounded-full hover:shadow-lg transition-all text-center"
          >
            View My Tokens
          </Link>
          
          <button
            onClick={handleCreateAnother}
            className="btn bg-transparent border border-purple-500 text-purple-500 font-medium py-3 px-8 rounded-full hover:bg-purple-500 hover:text-white hover:shadow-lg transition-all text-center"
          >
            Create Another Token
          </button>
          
          <Link 
            href="/"
            className="btn bg-transparent border border-gray-700 text-gray-400 font-medium py-3 px-8 rounded-full hover:bg-gray-700 hover:text-white hover:shadow-lg transition-all text-center"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}