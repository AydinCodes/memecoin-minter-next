'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { extractCidFromUrl } from '@/utils/ipfs-utils';
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

interface TokenMetadata {
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  tokenInfo?: {
    totalSupply?: number;
    decimals?: number;
  };
}

export default function TokenCreationSuccess({ result }: TokenCreationSuccessProps) {
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch metadata to display additional token info
  useEffect(() => {
    async function fetchMetadata() {
      try {
        setLoading(true);
        const response = await fetch(result.metadataUrl);
        if (response.ok) {
          const data = await response.json();
          setMetadata(data);
        }
      } catch (error) {
        console.error("Error fetching metadata:", error);
      } finally {
        setLoading(false);
      }
    }

    if (result.metadataUrl) {
      fetchMetadata();
    }
  }, [result.metadataUrl]);

  // Extract relevant information from result and metadata
  const cid = extractCidFromUrl(result.metadataUrl);
  const networkParam = result.explorerUrl.includes("?cluster=devnet") ? "devnet" : "mainnet-beta";
  
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="bg-[#171717] rounded-xl p-8 shadow-lg border border-purple-500/30 border-opacity-30">
        <div className="text-center mb-6">
          {/* Replace static success icon with animated checkmark */}
          <CheckmarkAnimation />
          
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
              {metadata && (
                <div className="mb-4">
                  <div className="text-gray-500 text-sm">Token Name / Symbol</div>
                  <div className="text-white text-xl mt-1">
                    {metadata.name} <span className="text-gray-400">({metadata.symbol})</span>
                  </div>
                </div>
              )}
              
              <div className="mb-4 relative">
                <div className="text-gray-500 text-sm flex items-center justify-between">
                  <span>Token Address</span>
                  <CopyButton textToCopy={result.mintAddress} />
                </div>
                <div className="font-mono text-white text-sm bg-[#333] p-2 rounded mt-1 overflow-x-auto">
                  {result.mintAddress}
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-gray-500 text-sm">Network</div>
                <div className="text-white mt-1 flex items-center">
                  <span className={networkParam === "devnet" ? "text-yellow-500" : "text-blue-500"}>
                    {networkParam === "devnet" ? "Devnet" : "Mainnet"}
                  </span>
                  {networkParam === "devnet" && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-900 text-yellow-300 rounded-full">
                      Testnet
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {metadata && metadata.description && (
            <div className="mt-4">
              <div className="text-gray-500 text-sm mb-1">Description</div>
              <div className="text-gray-300 bg-[#333] p-3 rounded text-sm">{metadata.description}</div>
            </div>
          )}
          
          <div className="mt-4 relative">
            <div className="text-gray-500 text-sm flex items-center justify-between">
              <span>Metadata URL</span>
              <CopyButton textToCopy={result.metadataUrl} />
            </div>
            <div className="font-mono text-white text-sm bg-[#333] p-2 rounded mt-1 overflow-x-auto">
              {result.metadataUrl}
            </div>
            <div className="text-xs text-gray-500 mt-1">IPFS CID: {cid}</div>
          </div>
          
          {metadata && metadata.tokenInfo && (
            <div className="flex flex-wrap gap-4 mt-4">
              {metadata.tokenInfo.totalSupply && (
                <div>
                  <div className="text-gray-500 text-sm">Total Supply</div>
                  <div className="text-white font-semibold">
                    {metadata.tokenInfo.totalSupply.toLocaleString()}
                  </div>
                </div>
              )}
              
              {metadata.tokenInfo.decimals !== undefined && (
                <div>
                  <div className="text-gray-500 text-sm">Decimals</div>
                  <div className="text-white font-semibold">{metadata.tokenInfo.decimals}</div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Social Links Section */}
        {metadata && (metadata.website || metadata.twitter || metadata.telegram || metadata.discord) && (
          <div className="social-links bg-[#222] rounded-lg p-5 mb-6">
            <h3 className="text-lg font-medium text-white mb-3">Social Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {metadata.website && (
                <a 
                  href={metadata.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-purple-400 hover:text-purple-300"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                  </svg>
                  Website
                </a>
              )}
              
              {metadata.twitter && (
                <a 
                  href={metadata.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-400 hover:text-blue-300"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                  </svg>
                  Twitter
                </a>
              )}
              
              {metadata.telegram && (
                <a 
                  href={metadata.telegram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-500 hover:text-blue-400"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                  </svg>
                  Telegram
                </a>
              )}
              
              {metadata.discord && (
                <a 
                  href={metadata.discord} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-indigo-400 hover:text-indigo-300"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  Discord
                </a>
              )}
            </div>
          </div>
        )}
        
        <div className="next-steps space-y-4 mb-8">
          <h2 className="text-xl font-semibold text-white">Next Steps</h2>
          
          <div className="step bg-[#222] p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-2">View Your Tokens</h3>
            <p className="text-gray-400 mb-2">Go to your tokens page to see all the tokens you've created.</p>
            <Link 
              href="/my-tokens"
              className="text-purple-500 hover:text-purple-400 inline-flex items-center"
            >
              Go to My Tokens
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </Link>
          </div>
          
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
            href="/my-tokens"
            className="btn bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium py-3 px-8 rounded-full hover:shadow-lg transition-all text-center"
          >
            View My Tokens
          </Link>
          
          <Link 
            href="/create-token"
            className="btn bg-transparent border border-purple-500 text-purple-500 font-medium py-3 px-8 rounded-full hover:bg-purple-500 hover:text-white hover:shadow-lg transition-all text-center"
          >
            Create Another Token
          </Link>
          
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