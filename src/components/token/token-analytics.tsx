'use client';

import React from 'react';
import { MintedTokenInfo } from '@/types/token';
import { formatNumberWithCommas } from '@/utils/token-utils';

interface TokenAnalyticsProps {
  tokens: MintedTokenInfo[];
}

export default function TokenAnalytics({ tokens }: TokenAnalyticsProps) {
  if (!tokens || tokens.length === 0) return null;

  // Calculate total token count
  const tokenCount = tokens.length;

  // Calculate total supply across all tokens
  const totalSupply = tokens.reduce((sum, token) => 
    sum + (token.tokenInfo?.totalSupply || 0), 0);

  // Count revoked authorities across all tokens
  const revokedAuthoritiesCount = {
    mint: tokens.filter(token => token.authorities?.mintRevoked).length,
    freeze: tokens.filter(token => token.authorities?.freezeRevoked).length,
    update: tokens.filter(token => token.authorities?.updateRevoked).length
  };

  // Count tokens with social links
  const tokensWithSocialLinks = tokens.filter(token => 
    token.website || token.twitter || token.telegram || token.discord
  ).length;

  return (
    <div className="bg-[#171717] rounded-xl p-6 shadow-lg mb-8">
      <h2 className="text-xl font-semibold text-white mb-4">Token Analytics</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#222] p-4 rounded-lg">
          <div className="text-purple-400 text-sm mb-1">Total Tokens</div>
          <div className="text-white text-2xl font-bold">{tokenCount}</div>
        </div>
        
        <div className="bg-[#222] p-4 rounded-lg">
          <div className="text-blue-400 text-sm mb-1">Total Supply</div>
          <div className="text-white text-2xl font-bold">{formatNumberWithCommas(totalSupply)}</div>
        </div>
        
        <div className="bg-[#222] p-4 rounded-lg">
          <div className="text-green-400 text-sm mb-1">Revoked Authorities</div>
          <div className="flex space-x-2 mt-2">
            <div className="bg-green-900/30 text-green-300 text-xs px-2 py-1 rounded">
              Mint: {revokedAuthoritiesCount.mint}
            </div>
            <div className="bg-green-900/30 text-green-300 text-xs px-2 py-1 rounded">
              Freeze: {revokedAuthoritiesCount.freeze}
            </div>
            <div className="bg-green-900/30 text-green-300 text-xs px-2 py-1 rounded">
              Update: {revokedAuthoritiesCount.update}
            </div>
          </div>
        </div>
        
        <div className="bg-[#222] p-4 rounded-lg">
          <div className="text-yellow-400 text-sm mb-1">Social Links</div>
          <div className="text-white">
            <span className="text-2xl font-bold">{tokensWithSocialLinks}</span>
            <span className="text-gray-400 text-sm ml-1">/ {tokenCount}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        Overview of your created tokens and their configuration.
      </div>
    </div>
  );
}