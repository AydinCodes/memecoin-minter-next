// src/types/env.d.ts

declare namespace NodeJS {
  interface ProcessEnv {
    // Solana Network settings
    NEXT_PUBLIC_SOLANA_NETWORK: "devnet" | "mainnet-beta";

    // Fee recipient wallet address
    NEXT_PUBLIC_FEE_WALLET: string;

    // Pinata IPFS settings
    NEXT_PUBLIC_PINATA_GATEWAY: string;
    PINATA_JWT: string;

    // Solana network fee
    NEXT_PUBLIC_SOLANA_NETWORK_FEE: string;

    // Server-side RPC endpoints (not exposed to client)
    SOLANA_MAINNET_RPC: string;
    SOLANA_DEVNET_RPC: string;

    REVOKE_UPDATE_PRIVATE_KEY: string;
  }
}