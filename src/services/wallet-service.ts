// src/services/wallet-service.ts
import { WalletAdapter } from '@solana/wallet-adapter-base';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { SOLANA_NETWORK } from '@/config';

// Get the Solana connection based on the configured network
export const getSolanaConnection = (): Connection => {
  const network = SOLANA_NETWORK === 'mainnet-beta' ? 'mainnet-beta' : 'devnet';
  return new Connection(clusterApiUrl(network), 'confirmed');
};

// Save the current wallet's public key to localStorage for reference
export const saveWalletPublicKey = (publicKey: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('walletPublicKey', publicKey);
  }
};

// Get the saved wallet public key
export const getSavedWalletPublicKey = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('walletPublicKey');
  }
  return null;
};

// Check if wallet is properly connected
export const isWalletConnected = (wallet: any): boolean => {
  // Debug log to help diagnose issues
  console.log("Wallet connection check:", {
    walletExists: !!wallet,
    publicKeyExists: wallet ? !!wallet.publicKey : false,
    adapterExists: wallet ? !!wallet.adapter : false,
    adapterConnected: wallet?.adapter ? !!wallet.adapter.connected : false
  });
  
  // For some wallets, adapter.connected might not be reliable
  // Consider a wallet connected if it has a wallet object and a public key
  return !!wallet && !!wallet.publicKey;
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