'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletRequired from '@/components/wallet/wallet-required';
import TokenList from '@/components/token/token-list';
import TokenAnalytics from '@/components/token/token-analytics';
import Loading from '@/components/ui/loading';
import NoTokensFound from '@/components/token/no-tokens-found';
import TokenErrorState from '@/components/token/token-error-state';
import { TokenSkeletonList } from '@/components/token/token-skeleton';
import { getUserMintedTokens } from '@/services/token-discovery-service';
import { MintedTokenInfo } from '@/types/token';

export default function MyTokensPage() {
  const { connected, publicKey } = useWallet();
  const [tokens, setTokens] = useState<MintedTokenInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserTokens = useCallback(async () => {
    if (!connected || !publicKey) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const userTokens = await getUserMintedTokens(publicKey.toString());
      setTokens(userTokens);
    } catch (err) {
      console.error('Error fetching user tokens:', err);
      setError('Failed to fetch your minted tokens. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey]);

  useEffect(() => {
    fetchUserTokens();
  }, [fetchUserTokens]);

  // If wallet is not connected, show connect wallet prompt
  if (!connected) {
    return <WalletRequired message="Connect your wallet to see your minted tokens" />;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-center mb-6">
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Discovering Your Tokens
            </span>
          </h1>
          <div className="flex justify-center mb-10">
            <Loading message="Please wait while we fetch your tokens..." steps={["Connecting to wallet", "Searching blockchain", "Retrieving token data"]} currentStepIndex={2} />
          </div>
          
          {/* Show skeleton UI while loading */}
          <div className="mt-12">
            <TokenSkeletonList />
          </div>
        </div>
      </div>
    );
  }

  // Show error message if there was an error
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <TokenErrorState 
            message={error} 
            onRetry={fetchUserTokens} 
          />
        </div>
      </div>
    );
  }

  // If no tokens are found, show no tokens message
  if (tokens.length === 0) {
    return <NoTokensFound />;
  }

  // Show token list
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-center mb-6">
          <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            My Minted Tokens
          </span>
        </h1>
        <p className="text-center text-gray-400 mb-6">
          View and manage all tokens you've created with SolMinter
        </p>
        
        <div className="flex justify-center mb-10">
          <button 
            onClick={fetchUserTokens}
            className="flex items-center bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
            disabled={loading}
          >
            <svg className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Refresh Tokens
          </button>
        </div>
        
        {/* Add Token Analytics component */}
        <TokenAnalytics tokens={tokens} />
        
        <TokenList tokens={tokens} />
      </div>
    </div>
  );
}