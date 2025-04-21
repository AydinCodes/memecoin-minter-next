'use client';

import { MintedTokenInfo } from '@/types/token';
import TokenCard from './token-card';

interface TokenListProps {
  tokens: MintedTokenInfo[];
}

export default function TokenList({ tokens }: TokenListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {tokens.map((token) => (
        <TokenCard key={token.mintAddress} token={token} />
      ))}
    </div>
  );
}