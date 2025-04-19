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