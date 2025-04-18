'use client';

import Link from 'next/link';
import React from 'react';

interface TokenCreationSuccessProps {
  result: {
    mintAddress: string;
    metadataUrl: string;
    imageUrl: string;
    explorerUrl: string;
  };
}

export default function TokenCreationSuccess({ result }: TokenCreationSuccessProps) {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="bg-[#171717] rounded-xl p-8 shadow-lg border border-green-500 border-opacity-30">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">Token Created Successfully!</h1>
          <p className="text-gray-400 text-lg">Your Solana token has been created and is ready to use.</p>
        </div>
        
        <div className="token-info bg-[#222] rounded-lg p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="token-image flex items-center justify-center">
              <img 
                src={result.imageUrl} 
                alt="Token Logo" 
                className="w-32 h-32 rounded-full border-4 border-gray-700"
              />
            </div>
            
            <div className="token-details">
              <div className="mb-4">
                <div className="text-gray-500 text-sm">Token Address</div>
                <div className="font-mono text-white text-sm bg-[#333] p-2 rounded mt-1 overflow-x-auto">
                  {result.mintAddress}
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-gray-500 text-sm">Metadata URL</div>
                <div className="font-mono text-white text-sm bg-[#333] p-2 rounded mt-1 overflow-x-auto">
                  {result.metadataUrl}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="next-steps space-y-4 mb-8">
          <h2 className="text-xl font-semibold text-white">Next Steps</h2>
          
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
          
          <div className="step bg-[#222] p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-2">View on Explorer</h3>
            <p className="text-gray-400 mb-2">Check your token on the Solana blockchain explorer.</p>
            <a 
              href={result.explorerUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-500 hover:text-purple-400 inline-flex items-center"
            >
              View on Explorer
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
            </a>
          </div>
        </div>
        
        <div className="buttons flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
          <Link 
            href="/"
            className="btn bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium py-3 px-8 rounded-full hover:shadow-lg transition-all text-center"
          >
            Back to Home
          </Link>
          
          <Link 
            href="/create-token"
            className="btn bg-transparent border border-purple-500 text-purple-500 font-medium py-3 px-8 rounded-full hover:bg-purple-500 hover:text-white hover:shadow-lg transition-all text-center"
          >
            Create Another Token
          </Link>
        </div>
      </div>
    </div>
  );
}