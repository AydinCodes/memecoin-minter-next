// src/config/index.ts

// Solana network configuration
export const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';

// RPC endpoints
export const SOLANA_MAINNET_RPC = process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC;
export const SOLANA_DEVNET_RPC = process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC;

// Fee recipient wallet - address that will receive token creation fees
export const FEE_RECIPIENT_WALLET = process.env.NEXT_PUBLIC_FEE_WALLET || '8oUmkz9VmF9upLxUg6qp6iaq5N4A86bUuo37SJvXvzWt';

// Solana network fee in SOL - this amount is subtracted from the total fee
export const SOLANA_NETWORK_FEE = parseFloat(process.env.NEXT_PUBLIC_SOLANA_NETWORK_FEE || '0.01862');

// Total fee for token creation - flat fee of 0.05 SOL
export const TOTAL_FEE = parseFloat(process.env.NEXT_PUBLIC_TOTAL_FEE || '0.05');

// IPFS/Pinata configuration
export const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';
export const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
export const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;

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
export const TOKEN_METADATA_PROGRAM_ID = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s';

// Program ID for the SPL Token Program
export const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';