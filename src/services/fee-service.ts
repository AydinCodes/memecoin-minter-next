// src/services/fee-service.ts

export interface FeeOptions {
  revokeMint: boolean
  revokeFreeze: boolean
  revokeUpdate: boolean
  socialLinks: boolean
  creatorInfo: boolean
  largeImageSize?: boolean
}

// Fee constants with original and discounted rates
export const FEE_CONSTANTS = {
  BASE_FEE: 0,           // No base fee as requested
  ORIGINAL_FEATURE_FEE: 0.2, // Original price before discount
  AUTHORITY_FEE: 0.1,    // Discounted fee per authority revoked (50% off)
  SOCIAL_LINKS_FEE: 0.1,  // Discounted fee for social links (50% off)
  CREATOR_INFO_FEE: 0.1,  // Discounted fee for creator info (50% off)
  LARGE_IMAGE_FEE: 0.1,   // Fee for enabling large image size
  MINIMUM_FEE: 0.1       // Minimum fee for any token creation
};

// Calculate the fee based on selected options
export function calculateFee(options: FeeOptions): number {
  let fee = FEE_CONSTANTS.BASE_FEE;

  // Add fee for each enabled feature
  if (options.revokeMint) fee += FEE_CONSTANTS.AUTHORITY_FEE;
  if (options.revokeFreeze) fee += FEE_CONSTANTS.AUTHORITY_FEE;
  if (options.revokeUpdate) fee += FEE_CONSTANTS.AUTHORITY_FEE;
  if (options.socialLinks) fee += FEE_CONSTANTS.SOCIAL_LINKS_FEE;
  if (options.creatorInfo) fee += FEE_CONSTANTS.CREATOR_INFO_FEE;
  if (options.largeImageSize) fee += FEE_CONSTANTS.LARGE_IMAGE_FEE;

  // Ensure minimum fee
  fee = Math.max(fee, FEE_CONSTANTS.MINIMUM_FEE);

  // Return the total fee amount rounded to 2 decimal places
  return Math.round(fee * 100) / 100;
}

// Format the fee for display
export function formatFee(fee: number): string {
  return `${fee.toFixed(2)} SOL`;
}

// Get the original price (non-discounted) for display
export function getOriginalPrice(options: FeeOptions): number {
  let originalPrice = 0;
  
  // Calculate original price (2x the discounted price for each feature)
  if (options.revokeMint) originalPrice += FEE_CONSTANTS.ORIGINAL_FEATURE_FEE;
  if (options.revokeFreeze) originalPrice += FEE_CONSTANTS.ORIGINAL_FEATURE_FEE;
  if (options.revokeUpdate) originalPrice += FEE_CONSTANTS.ORIGINAL_FEATURE_FEE;
  if (options.socialLinks) originalPrice += FEE_CONSTANTS.ORIGINAL_FEATURE_FEE;
  if (options.creatorInfo) originalPrice += FEE_CONSTANTS.ORIGINAL_FEATURE_FEE;
  if (options.largeImageSize) originalPrice += FEE_CONSTANTS.ORIGINAL_FEATURE_FEE;
  
  // Ensure minimum original price
  originalPrice = Math.max(originalPrice, FEE_CONSTANTS.ORIGINAL_FEATURE_FEE);
  
  return Math.round(originalPrice * 100) / 100;
}

// Format the original price with strikethrough for display
export function formatOriginalFee(fee: number): string {
  return `${fee.toFixed(2)} SOL`;
}