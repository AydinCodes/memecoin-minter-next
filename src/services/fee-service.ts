// src/services/fee-service.ts

import { SOLANA_NETWORK_FEE, TOTAL_FEE } from "@/config";

export interface FeeOptions {
  revokeMint?: boolean;
  revokeFreeze?: boolean;
  revokeUpdate?: boolean;
  socialLinks?: boolean;
  creatorInfo?: boolean;
  largeImageSize?: boolean;
}

// Fee constants with updated pricing strategy
export const FEE_CONSTANTS = {
  BASE_FEE: 0,              // No base fee for most features
  LARGE_IMAGE_FEE: 0.05,    // Fee for enabling large image size
  MINIMUM_FEE: 0,           // No minimum fee (everything is free except large image)
  ORIGINAL_FEATURE_FEE: 0.1 // For display purposes only
};

// Calculate the fee based on selected options
export function calculateFee(options: FeeOptions): number {
  // The only feature that costs anything is large image size
  if (options.largeImageSize) {
    return TOTAL_FEE || 0.05; // Use TOTAL_FEE from config or fall back to 0.05
  }
  
  // Everything else is free
  return 0;
}

// Format the fee for display
export function formatFee(fee: number): string {
  return `${fee.toFixed(2)} SOL`;
}

// Get the original price (just for display purposes)
export function getOriginalPrice(options: FeeOptions): number {
  // For display purposes only - show a higher "original" price
  return 0.1;
}

// Format the original price with strikethrough for display
export function formatOriginalFee(fee: number): string {
  return `${fee.toFixed(2)} SOL`;
}