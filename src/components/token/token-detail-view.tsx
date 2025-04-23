'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MintedTokenInfo } from '@/types/token';
import { SOLANA_NETWORK } from '@/config';
import { formatNumberWithCommas } from '@/utils/token-utils';

interface TokenDetailViewProps {
  token: MintedTokenInfo;
  onClose: () => void;
}

export default function TokenDetailView({ token, onClose }: TokenDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'social' | 'explorer'>('details');
  const modalRef = useRef<HTMLDivElement>(null);
  
  const networkParam = SOLANA_NETWORK === 'devnet' ? '?cluster=devnet' : '';
  const explorerUrl = `https://explorer.solana.com/address/${token.mintAddress}${networkParam}`;
  const raydiumLiquidityUrl = `https://raydium.io/liquidity/create-pool${networkParam.replace('?', '#')}`;
  const raydiumSwapUrl = `https://raydium.io/swap/?inputCurrency=sol&outputCurrency=${token.mintAddress}${networkParam.replace('?', '&')}`;

  // Check if social links exist
  const hasSocialLinks = !!(token.website || token.twitter || token.telegram || token.discord);

  // Handle click outside to close modal
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    // Add event listener when the component mounts
    document.addEventListener('mousedown', handleClickOutside);
    
    // Prevent body scrolling while modal is open
    document.body.style.overflow = 'hidden';
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-auto">
      <div 
        ref={modalRef}
        className="relative bg-[#171717] rounded-xl shadow-xl border border-gray-800 max-w-2xl w-full max-h-[90vh] flex flex-col"
      >
        {/* Header - Fixed position */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h3 className="text-2xl font-bold text-white truncate pr-4">{token.name} ({token.symbol})</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white flex-shrink-0 hover:cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {/* Tabs - Fixed position */}
        <div className="flex border-b border-gray-800 sticky top-0 bg-[#171717] z-10">
          <button 
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-3 px-4 text-center ${activeTab === 'details' 
              ? 'text-purple-500 border-b-2 border-purple-500'
              : 'text-gray-400 hover:text-gray-200 hover:cursor-pointer'}`}
          >
            Token Details
          </button>
          {hasSocialLinks && (
            <button 
              onClick={() => setActiveTab('social')}
              className={`flex-1 py-3 px-4 text-center ${activeTab === 'social' 
                ? 'text-purple-500 border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-gray-200 hover:cursor-pointer'}`}
            >
              Social Links
            </button>
          )}
          <button 
            onClick={() => setActiveTab('explorer')}
            className={`flex-1 py-3 px-4 text-center ${activeTab === 'explorer' 
              ? 'text-purple-500 border-b-2 border-purple-500'
              : 'text-gray-400 hover:text-gray-200 hover:cursor-pointer'}`}
          >
            Explorer
          </button>
        </div>
        
        {/* Content - Scrollable area */}
        <div className="p-6 overflow-y-auto flex-grow">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-900/20 to-blue-900/20 flex items-center justify-center flex-shrink-0">
                  {token.imageUrl || token.image ? (
                    <img 
                      src={token.imageUrl || token.image} 
                      alt={token.name} 
                      className="w-28 h-28 object-contain rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.innerHTML = `
                          <div class="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center">
                            <span class="text-3xl font-bold text-gray-600">${token.symbol.substring(0, 2)}</span>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-600">{token.symbol.substring(0, 2)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-xl font-bold text-white">{token.name}</h4>
                  <p className="text-purple-400 font-mono">{token.symbol}</p>
                  
                  <div className="mt-2 space-y-1">
                    <div className="text-gray-300">
                      <span className="text-gray-500">Total Supply:</span> {formatNumberWithCommas(token.tokenInfo?.totalSupply || 0)}
                    </div>
                    <div className="text-gray-300">
                      <span className="text-gray-500">Decimals:</span> {token.tokenInfo?.decimals || 9}
                    </div>
                    <div className="text-gray-300">
                      <span className="text-gray-500">Creator:</span> {token.creator || 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="text-white text-lg font-medium mb-2">Description</h5>
                <p className="text-gray-300 bg-[#222] p-3 rounded-lg">
                  {token.description || "No description provided"}
                </p>
              </div>
              
              <div>
                <h5 className="text-white text-lg font-medium mb-2">Token Address</h5>
                <div className="font-mono text-gray-300 bg-[#222] p-3 rounded-lg text-sm overflow-x-auto">
                  {token.mintAddress || token.mint}
                </div>
              </div>
              
              <div>
                <h5 className="text-white text-lg font-medium mb-2">Authorities</h5>
                <div className="bg-[#222] p-3 rounded-lg">
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-2 ${token.authorities?.mintRevoked ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-gray-300">Mint Authority: {token.authorities?.mintRevoked ? 'Revoked' : 'Active'}</span>
                    </li>
                    <li className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-2 ${token.authorities?.freezeRevoked ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-gray-300">Freeze Authority: {token.authorities?.freezeRevoked ? 'Revoked' : 'Active'}</span>
                    </li>
                    <li className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-2 ${token.authorities?.updateRevoked ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-gray-300">Update Authority: {token.authorities?.updateRevoked ? 'Revoked' : 'Active'}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'social' && hasSocialLinks && (
            <div className="space-y-6">
              {token.website && (
                <div>
                  <h5 className="text-white text-lg font-medium mb-2">Website</h5>
                  <a 
                    href={token.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-purple-400 hover:text-purple-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                    </svg>
                    <span className="break-all">{token.website}</span>
                  </a>
                </div>
              )}
              
              {token.twitter && (
                <div>
                  <h5 className="text-white text-lg font-medium mb-2">Twitter</h5>
                  <a 
                    href={token.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-400 hover:text-blue-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                    </svg>
                    <span className="break-all">{token.twitter}</span>
                  </a>
                </div>
              )}
              
              {token.telegram && (
                <div>
                  <h5 className="text-white text-lg font-medium mb-2">Telegram</h5>
                  <a 
                    href={token.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-500 hover:text-blue-400"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                    </svg>
                    <span className="break-all">{token.telegram}</span>
                  </a>
                </div>
              )}
              
              {token.discord && (
                <div>
                  <h5 className="text-white text-lg font-medium mb-2">Discord</h5>
                  <a 
                    href={token.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-indigo-400 hover:text-indigo-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    <span className="break-all">{token.discord}</span>
                  </a>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'explorer' && (
            <div className="space-y-6">
              <div>
                <h5 className="text-white text-lg font-medium mb-2">Explorer Links</h5>
                <div className="space-y-3">
                  <a 
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-purple-400 hover:text-purple-300 bg-[#222] p-3 rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                    <span>View on Solana Explorer</span>
                  </a>
                  
                  <a 
                    href={raydiumLiquidityUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-400 hover:text-blue-300 bg-[#222] p-3 rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>Create Liquidity Pool on Raydium</span>
                  </a>
                  
                  <a 
                    href={raydiumSwapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-green-400 hover:text-green-300 bg-[#222] p-3 rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                    </svg>
                    <span>Swap on Raydium</span>
                  </a>
                </div>
              </div>
              
              <div>
                <h5 className="text-white text-lg font-medium mb-2">IPFS Links</h5>
                <div className="space-y-3">
                  <a 
                    href={token.metadataUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-purple-400 hover:text-purple-300 bg-[#222] p-3 rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span>View Metadata on IPFS</span>
                  </a>
                  
                  {(token.image || token.imageUrl) && (
                    <a 
                      href={token.image || token.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-400 hover:text-blue-300 bg-[#222] p-3 rounded-lg"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <span>View Image on IPFS</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer - Fixed at bottom */}
        <div className="border-t border-gray-800 p-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Created with SolMinter
          </div>
          
          <button 
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-full transition-colors hover:cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}