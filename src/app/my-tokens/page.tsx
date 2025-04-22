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
      console.error("Error fetching user tokens:", err);
      setError("Failed to fetch your minted tokens. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey]);

  useEffect(() => {
    fetchUserTokens();
  }, [fetchUserTokens]);

  if (!connected) {
    return (
      <div className="min-h-screen">
        <WalletRequired message="Connect your wallet to see your minted tokens" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Discovering Your Tokens
            </span>
          </h1>
          {/* Just show the skeleton loaders—no cancel or retry here */}
          <TokenSkeletonList />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Only the error component handles retry */}
          <TokenErrorState message={error} onRetry={fetchUserTokens} />
        </div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return <NoTokensFound />;
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
        <TokenList tokens={tokens} />
      </div>
    </div>
  );
}
