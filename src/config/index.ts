// src/config/index.ts

// Solana network configuration
export const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';

// Fee recipient wallet
export const FEE_RECIPIENT_WALLET = process.env.NEXT_PUBLIC_FEE_WALLET || '8oUmkz9VmF9upLxUg6qp6iaq5N4A86bUuo37SJvXvzWt';

// IPFS configuration
export const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';

// Token creation fees
export const TOKEN_FEES = {
  BASE_FEE: 0.2,
  AUTHORITY_FEE: 0.1,
  SOCIAL_LINKS_FEE: 0.1,
  CREATOR_INFO_FEE: 0.1,
  MAX_FEE: 0.3 // Capped discount
};

// Default token configuration
export const DEFAULT_TOKEN_CONFIG = {
  decimals: 9,
  supply: 1000000000, // 1 billion
  revokeMint: true,
  revokeFreeze: true,
  revokeUpdate: true
};

// Explorer URL generator
export const getExplorerUrl = (address: string): string => {
  const network = SOLANA_NETWORK;
  return `https://explorer.solana.com/address/${address}${network === 'devnet' ? '?cluster=devnet' : ''}`;
};