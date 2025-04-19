// src/config/index.ts

// Solana network configuration
export const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';

// Fee recipient wallet - address that will receive token creation fees
export const FEE_RECIPIENT_WALLET = process.env.NEXT_PUBLIC_FEE_WALLET || '8oUmkz9VmF9upLxUg6qp6iaq5N4A86bUuo37SJvXvzWt';

// IPFS/Pinata configuration
export const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';
export const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
export const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;

// Token creation fees (in SOL)
export const TOKEN_FEES = {
  BASE_FEE: 0.2,  // Base fee for token creation
  AUTHORITY_FEE: 0.1, // Fee per authority revoked
  SOCIAL_LINKS_FEE: 0.1, // Fee for adding social links
  CREATOR_INFO_FEE: 0.1, // Fee for custom creator info
  MAX_FEE: 0.3 // Maximum fee (capped for discount)
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
export const getExplorerUrl = (address: string, isTransaction = false): string => {
  const network = SOLANA_NETWORK;
  const type = isTransaction ? 'tx' : 'address';
  return `https://explorer.solana.com/${type}/${address}${network === 'devnet' ? '?cluster=devnet' : ''}`;
};

// Metaplex Token Metadata Program ID (constant across all Solana networks)
export const TOKEN_METADATA_PROGRAM_ID = '4ncLWXQBRrwYbEe2J6CxvF8TkBWGR6Twcz3BCC4NVweB';

// Program ID for the SPL Token Program
export const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';