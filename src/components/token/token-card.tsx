'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MintedTokenInfo } from '@/types/token';
import { SOLANA_NETWORK } from '@/config';
import { formatNumberWithCommas } from '@/utils/token-utils';
import TokenDetailView from './token-detail-view';

interface TokenCardProps {
  token: MintedTokenInfo;
}

export default function TokenCard({ token }: TokenCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);

  const networkParam = SOLANA_NETWORK === 'devnet' ? '?cluster=devnet' : '';
  const explorerUrl = `https://explorer.solana.com/address/${token.mintAddress}${networkParam}`;
  const raydiumLiquidityUrl = `https://raydium.io/liquidity/create-pool${networkParam.replace('?', '#')}`;
  const raydiumSwapUrl = `https://raydium.io/swap/?inputCurrency=sol&outputCurrency=${token.mintAddress}${networkParam.replace('?', '&')}`;

  // Determine the image URL - might be in imageUrl or image property
  const actualImageUrl = token.imageUrl || token.image || '';

  useEffect(() => {
    // Reset image states when token changes
    setImageLoaded(false);
    setImageError(false);
    
    // Preload the image to check if it's valid
    if (actualImageUrl) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageError(true);
      img.src = actualImageUrl;
    } else {
      setImageError(true);
    }
  }, [token, actualImageUrl]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const openDetailView = () => {
    setShowDetailView(true);
  };

  const closeDetailView = () => {
    setShowDetailView(false);
  };

  return (
    <>
      <div 
        className="bg-[#171717] rounded-xl overflow-hidden shadow-lg border border-gray-800 hover:border-purple-500/30 transition-all cursor-pointer"
        onClick={openDetailView}
      >
        {/* Token Image Header */}
        <div className="h-48 bg-gradient-to-r from-purple-900/20 to-blue-900/20 relative flex items-center justify-center">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
          )}
          
          {!imageError ? (
            <img 
              src={actualImageUrl} 
              alt={`${token.name} logo`}
              className={`object-contain max-h-40 mx-auto ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              style={{ transition: 'opacity 0.3s ease-in-out' }}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-600">{token.symbol.substring(0, 2)}</span>
            </div>
          )}
        </div>
        
        {/* Token Info */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-white">{token.name}</h3>
              <p className="text-purple-400 font-mono">{token.symbol}</p>
            </div>
            <span className="bg-purple-900/30 text-purple-300 text-xs px-2 py-1 rounded-full">
              {token.tokenInfo?.decimals || 9} decimals
            </span>
          </div>
          
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {token.description || 'No description provided'}
          </p>
          
          <div className="mb-4">
            <div className="text-gray-500 text-xs mb-1">Token Address</div>
            <div className="font-mono text-xs bg-[#222] p-2 rounded overflow-hidden text-ellipsis">
              {token.mintAddress}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-gray-500 text-xs">Total Supply</div>
              <div className="text-white font-medium">
                {formatNumberWithCommas(token.tokenInfo?.totalSupply || 0)}
              </div>
            </div>
            
            <div>
              <div className="text-gray-500 text-xs">Revoked Authorities</div>
              <div className="flex space-x-1">
                {token.authorities?.mintRevoked && (
                  <span className="text-xs px-1 bg-green-900/30 text-green-300 rounded">Mint</span>
                )}
                {token.authorities?.freezeRevoked && (
                  <span className="text-xs px-1 bg-green-900/30 text-green-300 rounded">Freeze</span>
                )}
                {token.authorities?.updateRevoked && (
                  <span className="text-xs px-1 bg-green-900/30 text-green-300 rounded">Update</span>
                )}
              </div>
            </div>
          </div>

          {/* Social Links (if available) */}
          {(token.website || token.twitter || token.telegram || token.discord) && (
            <div className="flex space-x-3 mb-4">
              {token.website && (
                <a 
                  href={token.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-purple-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                  </svg>
                </a>
              )}
              
              {token.twitter && (
                <a 
                  href={token.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-blue-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                  </svg>
                </a>
              )}
              
              {token.telegram && (
                <a 
                  href={token.telegram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-blue-500"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                  </svg>
                </a>
              )}
              
              {token.discord && (
                <a 
                  href={token.discord} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-indigo-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </a>
              )}
            </div>
          )}
          
          {/* Action Links */}
          <div className="flex justify-between space-x-2 mt-6">
            <a 
              href={explorerUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 text-center bg-transparent border border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white text-sm font-medium py-2 px-3 rounded-full transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Explorer
            </a>
            
            <a 
              href={raydiumLiquidityUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 text-center bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white text-sm font-medium py-2 px-3 rounded-full transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Create Pool
            </a>
            
            <a 
              href={raydiumSwapUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 text-center bg-transparent border border-green-500 text-green-500 hover:bg-green-500 hover:text-white text-sm font-medium py-2 px-3 rounded-full transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Swap
            </a>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailView && (
        <TokenDetailView 
          token={token} 
          onClose={closeDetailView} 
        />
      )}
    </>
  );
}