// src/services/wallet-service.ts
import { WalletAdapter } from '@solana/wallet-adapter-base';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { SOLANA_NETWORK } from '@/config';

// Global variable to cache RPC connection to avoid creating multiple instances
let globalConnection: Connection | null = null;

// Get the Solana connection based on the configured network
export const getSolanaConnection = (): Connection => {
  // Return cached connection if available
  if (globalConnection) {
    return globalConnection;
  }
  
  const network = SOLANA_NETWORK === 'mainnet-beta' ? 'mainnet-beta' : 'devnet';
  
  // Check for custom RPC URLs from environment variables
  const customMainnetRPC = process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC;
  const customDevnetRPC = process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC;
  
  console.log(`Network: ${network}`);
  console.log(`Custom Mainnet RPC available: ${!!customMainnetRPC}`);
  console.log(`Custom Devnet RPC available: ${!!customDevnetRPC}`);
  
  // Use custom RPC URLs if available, otherwise fall back to public endpoints
  let connectionUrl: string;
  if (network === 'mainnet-beta' && customMainnetRPC) {
    console.log('Using custom mainnet RPC endpoint');
    connectionUrl = customMainnetRPC;
  } else if (network === 'devnet' && customDevnetRPC) {
    console.log('Using custom devnet RPC endpoint');
    connectionUrl = customDevnetRPC;
  } else {
    // Fall back to public endpoints
    console.log(`Using public ${network} RPC endpoint`);
    connectionUrl = clusterApiUrl(network);
  }
  
  // Create and cache the connection
  try {
    globalConnection = new Connection(connectionUrl, 'confirmed');
    console.log('Solana connection created successfully');
    return globalConnection;
  } catch (error) {
    console.error('Error creating Solana connection:', error);
    // Fall back to default public RPC if custom fails
    globalConnection = new Connection(clusterApiUrl(network), 'confirmed');
    return globalConnection;
  }
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
  // For some wallets, adapter.connected might not be reliable
  // Consider a wallet connected if it has a wallet object and a public key
  return !!wallet && !!wallet.publicKey;
};

// Get the wallet's SOL balance with improved error handling
export const getWalletBalance = async (publicKey: PublicKey): Promise<number | null> => {
  try {
    const connection = getSolanaConnection();
    const balance = await connection.getBalance(publicKey);
    return balance / 1_000_000_000; // Convert lamports to SOL
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    
    // Check for specific RPC errors
    if (error instanceof Error) {
      const errorMessage = error.message;
      if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
        console.error('RPC access forbidden. Please check your RPC endpoint configuration.');
      } else if (errorMessage.includes('429')) {
        console.error('RPC rate limit exceeded. Try again later or use a different RPC endpoint.');
      } else if (errorMessage.includes('timeout')) {
        console.error('RPC request timed out. Network may be congested.');
      }
    }
    
    // Return null to indicate an error occurred
    return null;
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