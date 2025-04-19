// src/services/fee-service.ts

export interface FeeOptions {
  revokeMint: boolean
  revokeFreeze: boolean
  revokeUpdate: boolean
  socialLinks: boolean
  creatorInfo: boolean
}

// Base fee plus optional feature fees
export function calculateFee(options: FeeOptions): number {
  let fee = 0.1; // Base fee for token creation - corrected to 0.1

  // Add fee for each enabled feature
  if (options.revokeMint)    fee += 0.1;
  if (options.revokeFreeze)  fee += 0.1;
  if (options.revokeUpdate)  fee += 0.1;
  if (options.socialLinks)   fee += 0.1;
  if (options.creatorInfo)   fee += 0.1;

  // Return the total fee amount rounded to 2 decimal places
  return Math.round(fee * 100) / 100;
}

// Format the fee for display
export function formatFee(fee: number): string {
  return `${fee.toFixed(2)} SOL`;
}