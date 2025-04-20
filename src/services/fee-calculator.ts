// src/services/fee-calculator.ts
// Functions for calculating and formatting token creation fees

import { SOLANA_NETWORK_FEE } from "@/config";

/**
 * Options for fee calculation
 */
export interface FeeOptions {
  revokeMint: boolean;
  revokeFreeze: boolean;
  revokeUpdate: boolean;
  socialLinks: boolean;
  creatorInfo: boolean;
}

/**
 * Fee calculation constants
 */
export const FEE_CONSTANTS = {
  BASE_FEE: 0.1,        // Base fee for token creation
  AUTHORITY_FEE: 0.1,   // Fee per authority revoked
  SOCIAL_LINKS_FEE: 0.1, // Fee for adding social links
  CREATOR_INFO_FEE: 0.1, // Fee for custom creator info
  MINIMUM_FEE: 0.1      // Minimum fee for any token creation
};

/**
 * Calculates the total fee based on selected options
 * @returns Fee amount in SOL
 */
export function calculateFee(options: FeeOptions): number {
  let fee = FEE_CONSTANTS.BASE_FEE;

  // Add fee for each enabled feature
  if (options.revokeMint) fee += FEE_CONSTANTS.AUTHORITY_FEE;
  if (options.revokeFreeze) fee += FEE_CONSTANTS.AUTHORITY_FEE;
  if (options.revokeUpdate) fee += FEE_CONSTANTS.AUTHORITY_FEE;
  if (options.socialLinks) fee += FEE_CONSTANTS.SOCIAL_LINKS_FEE;
  if (options.creatorInfo) fee += FEE_CONSTANTS.CREATOR_INFO_FEE;

  // Ensure minimum fee
  fee = Math.max(fee, FEE_CONSTANTS.MINIMUM_FEE);

  // Return the total fee amount rounded to 2 decimal places
  return Math.round(fee * 100) / 100;
}

/**
 * Calculates the net fee after deducting network costs
 * @returns Net fee amount in SOL that goes to the fee recipient
 */
export function calculateNetFee(totalFee: number): number {
  // Deduct the Solana network fee from the total
  const networkFee = SOLANA_NETWORK_FEE;
  return Math.max(totalFee - networkFee, 0);
}

/**
 * Format a fee amount for display
 * @returns Formatted fee string
 */
export function formatFee(fee: number): string {
  return `${fee.toFixed(2)} SOL`;
}

/**
 * Gets a breakdown of fees for display
 * @returns Object with fee breakdowns
 */
export function getFeeBreakdown(options: FeeOptions): {
  total: number;
  net: number;
  networkFee: number;
  components: { name: string; amount: number }[];
} {
  const total = calculateFee(options);
  const networkFee = SOLANA_NETWORK_FEE;
  const net = calculateNetFee(total);
  
  const components = [
    { name: "Base fee", amount: FEE_CONSTANTS.BASE_FEE }
  ];
  
  if (options.revokeMint) {
    components.push({ name: "Revoke mint authority", amount: FEE_CONSTANTS.AUTHORITY_FEE });
  }
  
  if (options.revokeFreeze) {
    components.push({ name: "Revoke freeze authority", amount: FEE_CONSTANTS.AUTHORITY_FEE });
  }
  
  if (options.revokeUpdate) {
    components.push({ name: "Revoke update authority", amount: FEE_CONSTANTS.AUTHORITY_FEE });
  }
  
  if (options.socialLinks) {
    components.push({ name: "Social links", amount: FEE_CONSTANTS.SOCIAL_LINKS_FEE });
  }
  
  if (options.creatorInfo) {
    components.push({ name: "Creator info", amount: FEE_CONSTANTS.CREATOR_INFO_FEE });
  }
  
  return {
    total,
    net,
    networkFee,
    components
  };
}