// Update or create this in a shared location like src/types/token.ts

export interface FormDataType {
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  description: string;
  logo: File | null;
  revokeMint: boolean;
  revokeFreeze: boolean;
  revokeUpdate: boolean;
  socialLinks: boolean;
  creatorInfo: boolean;
  creatorName: string; // Added for Creator's Info
  website: string;
  twitter: string;
  telegram: string;
  discord: string;
}

export interface TokenResult {
  mintAddress: string;
  metadataUrl: string;
  imageUrl: string;
  explorerUrl: string;
}

// New interface for minted token information retrieved from Pinata/IPFS
export interface MintedTokenInfo {
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  imageUrl?: string; // Alternative property name for image
  mintAddress: string;
  mint?: string;     // Alternative property name for mintAddress
  creator?: string;
  metadataUrl?: string;
  pinHash?: string;
  
  // Social links
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  
  // Token information
  tokenInfo?: {
    chain?: string;
    totalSupply: number;
    circulatingSupply?: number;
    decimals: number;
  };
  
  // Authority status
  authorities?: {
    mintRevoked: boolean;
    freezeRevoked: boolean;
    updateRevoked: boolean;
  };
  
  // Session tracking
  sessionUuid?: string;
  createdOn?: string;
}