// src/services/wallet-service.ts
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
  
  // Use public endpoints for client-side
  console.log(`Using public ${network} RPC endpoint for client-side`);
  const connectionUrl = clusterApiUrl(network);
  
  // Create and cache the connection
  try {
    globalConnection = new Connection(connectionUrl, 'confirmed');
    console.log('Solana connection created successfully');
    return globalConnection;
  } catch (error) {
    console.error('Error creating Solana connection:', error);
    // Fall back to default public RPC
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

// Get the wallet's SOL balance using the API endpoint
export const getWalletBalance = async (publicKey: PublicKey): Promise<number | null> => {
  try {
    const response = await fetch(`/api/wallet-balance?publicKey=${publicKey.toString()}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from wallet-balance API:', errorText);
      return null;
    }
    
    const data = await response.json();
    return data.success ? data.balance : null;
  } catch (error) {
    console.error('Error getting wallet balance:', error);
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

// Get the latest blockhash from the API
export const getLatestBlockhash = async (): Promise<{ blockhash: string, lastValidBlockHeight: number } | null> => {
  try {
    const response = await fetch('/api/blockhash');
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from blockhash API:', errorText);
      return null;
    }
    
    const data = await response.json();
    return data.success ? { 
      blockhash: data.blockhash, 
      lastValidBlockHeight: data.lastValidBlockHeight 
    } : null;
  } catch (error) {
    console.error('Error getting latest blockhash:', error);
    return null;
  }
};

// Send and confirm a transaction using the API
export const sendAndConfirmTransaction = async (serializedTransaction: string): Promise<{ 
  success: boolean; 
  signature?: string; 
  error?: string; 
}> => {
  try {
    const response = await fetch('/api/transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ serializedTransaction })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { 
        success: false, 
        error: errorData.error || 'Failed to send transaction'
      };
    }
    
    const data = await response.json();
    return { 
      success: data.success, 
      signature: data.signature,
      error: data.error
    };
  } catch (error) {
    console.error('Error sending transaction:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error sending transaction'
    };
  }
};