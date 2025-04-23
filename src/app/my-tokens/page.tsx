// src/app/my-tokens/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import WalletRequired from "@/components/wallet/wallet-required";
import TokenList from "@/components/token/token-list";
import Loading from "@/components/ui/loading";
import NoTokensFound from "@/components/token/no-tokens-found";
import TokenErrorState from "@/components/token/token-error-state";
import { TokenSkeletonList } from "@/components/token/token-skeleton";
import { getUserMintedTokens } from "@/services/token-discovery-service";
import { MintedTokenInfo } from "@/types/token";

export default function MyTokensPage() {
  const { connected, publicKey } = useWallet();
  const [tokens, setTokens] = useState<MintedTokenInfo[]>([]);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [backgroundLoading, setBackgroundLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearchedAllPages, setHasSearchedAllPages] = useState<boolean>(false);

  const fetchTokensPage = useCallback(async (pageOffset: number, isInitialLoad: boolean) => {
    if (!connected || !publicKey) return { tokens: [], hasMorePages: false };

    try {
      if (isInitialLoad) {
        setInitialLoading(true);
      } else {
        setBackgroundLoading(true);
      }
      
      setError(null);

      const response = await fetch(`/api/user-tokens?publicKey=${publicKey.toString()}&pageOffset=${pageOffset}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${errorText}`);
      }
      
      const data = await response.json();
      return {
        tokens: data.tokens || [],
        hasMorePages: data.hasMorePages,
        nextPageOffset: data.nextPageOffset
      };
    } catch (err) {
      console.error(`Error fetching user tokens page ${pageOffset}:`, err);
      setError("Failed to fetch your minted tokens. Please try again later.");
      return { tokens: [], hasMorePages: false };
    } finally {
      if (isInitialLoad) {
        setInitialLoading(false);
      }
    }
  }, [connected, publicKey]);

  const fetchAllUserTokens = useCallback(async () => {
    if (!connected || !publicKey) return;
    
    // Start with the first page (initial load)
    const firstPageResult = await fetchTokensPage(0, true);
    setTokens(firstPageResult.tokens);
    
    // If there are no more pages or we got tokens, we're done with initial load
    if (!firstPageResult.hasMorePages) {
      setHasSearchedAllPages(true);
      setBackgroundLoading(false);
      return;
    }
    
    // Continue loading in the background
    setBackgroundLoading(true);
    
    // Function to recursively fetch all pages
    const fetchRemainingPages = async (nextOffset: number, accumulatedTokens: MintedTokenInfo[]) => {
      const result = await fetchTokensPage(nextOffset, false);
      
      // Combine new tokens with existing ones
      const updatedTokens = [...accumulatedTokens, ...result.tokens];
      setTokens(updatedTokens);
      
      if (result.hasMorePages && result.nextPageOffset) {
        // Continue to next page
        return fetchRemainingPages(result.nextPageOffset, updatedTokens);
      } else {
        // All pages loaded
        setHasSearchedAllPages(true);
        setBackgroundLoading(false);
        return updatedTokens;
      }
    };
    
    // Start background loading from the second page
    if (firstPageResult.nextPageOffset) {
      fetchRemainingPages(firstPageResult.nextPageOffset, firstPageResult.tokens)
        .catch(error => {
          console.error("Error during background loading:", error);
          // Even if background loading fails, we still show what we found initially
          setBackgroundLoading(false);
          setHasSearchedAllPages(true);
        });
    }
  }, [connected, publicKey, fetchTokensPage]);

  useEffect(() => {
    fetchAllUserTokens();
  }, [fetchAllUserTokens]);

  if (!connected) {
    return (
      <div className="min-h-screen">
        <WalletRequired message="Connect your wallet to see your minted tokens" />
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Discovering Your Tokens
            </span>
          </h1>
          <TokenSkeletonList />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <TokenErrorState message={error} onRetry={fetchAllUserTokens} />
        </div>
      </div>
    );
  }

  if (tokens.length === 0 && !backgroundLoading && hasSearchedAllPages) {
    return <NoTokensFound />;
  }

  if (tokens.length === 0 && backgroundLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Searching Deeper For Your Tokens
            </span>
          </h1>
          <p className="text-gray-400 mb-8">
            We're still looking for your tokens. This might take a bit longer if you minted tokens a while ago.
          </p>
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
          <NoTokensFound isStillSearching={true} />
        </div>
      </div>
    );
  }

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
        
        {backgroundLoading && (
          <div className="text-center mb-6 p-2 bg-purple-900/20 rounded-lg border border-purple-500/30">
            <p className="text-purple-300 flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Still searching for more of your tokens...
            </p>
          </div>
        )}
        
        <TokenList tokens={tokens} />
      </div>
    </div>
  );
}