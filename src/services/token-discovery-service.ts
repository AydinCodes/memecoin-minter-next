// src/services/token-discovery-service.ts
// Service to discover tokens minted by the user

import { MintedTokenInfo } from '@/types/token';
import { PINATA_GATEWAY } from '@/config';

/**
 * Fetches tokens minted by a user from Pinata IPFS
 * @param publicKey - The public key of the user's wallet
 * @returns Array of minted token information
 */
export async function getUserMintedTokens(publicKey: string): Promise<MintedTokenInfo[]> {
  try {
    console.log(`Fetching tokens for wallet: ${publicKey}`);
    
    // Call our API endpoint that will search Pinata for user tokens
    const response = await fetch(`/api/user-tokens?publicKey=${encodeURIComponent(publicKey)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user tokens: ${response.statusText}`);
    }

    const data = await response.json();
    return data.tokens;
  } catch (error) {
    console.error('Error in getUserMintedTokens:', error);
    throw error;
  }
}

/**
 * Fetches individual token data from IPFS URL
 * @param ipfsUrl - The IPFS URL to the token metadata
 * @returns Parsed token metadata
 */
export async function getTokenMetadata(ipfsUrl: string): Promise<MintedTokenInfo> {
  try {
    const response = await fetch(ipfsUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch token metadata: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    throw error;
  }
}

/**
 * Fetches token metadata for multiple tokens
 * @param cidList - List of CIDs to fetch
 * @returns Mapped token information
 */
export async function getTokensMetadata(cidList: string[]): Promise<MintedTokenInfo[]> {
  try {
    const gateway = PINATA_GATEWAY || 'gateway.pinata.cloud';
    
    // Fetch all token metadata in parallel
    const tokenPromises = cidList.map(async (cid) => {
      const url = `https://${gateway}/ipfs/${cid}`;
      return getTokenMetadata(url);
    });
    
    return await Promise.all(tokenPromises);
  } catch (error) {
    console.error('Error in getTokensMetadata:', error);
    throw error;
  }
}