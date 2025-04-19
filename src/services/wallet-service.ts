// src/services/wallet-service.ts
import { WalletAdapter } from '@solana/wallet-adapter-base';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { SOLANA_NETWORK } from '@/config';

// Get the Solana connection based on the configured network
export const getSolanaConnection = (): Connection => {
  const network = SOLANA_NETWORK === 'mainnet-beta' ? 'mainnet-beta' : 'devnet';
  return new Connection(clusterApiUrl(network), 'confirmed');
};

// Check if wallet is properly connected
export const isWalletConnected = (wallet: any): boolean => {
  return !!wallet && !!wallet.publicKey && !!wallet.adapter && !!wallet.adapter.connected;
};

// Get the wallet's SOL balance
export const getWalletBalance = async (publicKey: PublicKey): Promise<number> => {
  try {
    const connection = getSolanaConnection();
    const balance = await connection.getBalance(publicKey);
    return balance / 1_000_000_000; // Convert lamports to SOL
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    return 0;
  }
};

// Format the wallet address for display
export const formatWalletAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

// Get the Solana explorer URL for a transaction or address
export const getExplorerUrl = (addressOrSignature: string, isTransaction = false): string => {
  const network = SOLANA_NETWORK === 'devnet' ? '?cluster=devnet' : '';
  const type = isTransaction ? 'tx' : 'address';
  return `https://explorer.solana.com/${type}/${addressOrSignature}${network}`;
};