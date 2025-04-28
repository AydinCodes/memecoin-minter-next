// src/services/token-creation/token-types.ts
// Type definitions for token creation process

import { PublicKey } from "@solana/web3.js";

/**
 * Metadata parameters for token creation
 */
export interface TokenMetadataParams {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators: TokenCreator[] | null;
  collection: TokenCollection | null;
  uses: any | null;
  isMutable: boolean;
}

/**
 * Creator information for token metadata
 */
export interface TokenCreator {
  address: PublicKey;
  verified: boolean;
  share: number;
}

/**
 * Collection information for token metadata
 */
export interface TokenCollection {
  key: string;
  verified: boolean;
}

/**
 * Parameters for server-side transaction signing
 */
export interface ServerSignParams {
  mintPrivateKey: string;
  metadataUrl: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenSupply: number;
  payerPublicKey: string;
  hasCreators: boolean;
  revokeUpdate: boolean;
  revokeMint: boolean;
  revokeFreeze: boolean;
  recentBlockhash: string;
  feeWalletPubkey?: string;
  feeAmountInLamports: number;
  includeFeeTx: boolean;
  useServerUpdateAuthority?: boolean; // New parameter to distinguish flows
}

/**
 * Response from server-side transaction signing
 */
export interface ServerSignResponse {
  success: boolean;
  signedTransaction: string;
  updateAuthority: string;
  mintAddress: string;
  error?: string;
}