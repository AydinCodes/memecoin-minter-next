// src/services/token-creation/token-validation.ts
// Validation functions for token creation inputs

/**
 * Validates a token name
 */
export function isValidTokenName(name: string): boolean {
  // Check if name is present
  if (!name || name.trim() === '') {
    return false;
  }
  
  // Check length (Solana metadata has a reasonable limit)
  if (name.length > 32) {
    return false;
  }
  
  // Check for invalid characters - allow more flexibility than the original
  const validNameRegex = /^[a-zA-Z0-9\s_\-\.]+$/;
  if (!validNameRegex.test(name)) {
    return false;
  }
  
  return true;
}

/**
 * Validates a token symbol
 */
export function isValidTokenSymbol(symbol: string): boolean {
  // Check if symbol is present
  if (!symbol || symbol.trim() === '') {
    return false;
  }
  
  // Check length (usually 2-10 characters for token symbols)
  if (symbol.length > 10) {
    return false;
  }
  
  // Allow more flexibility in symbol format
  const validSymbolRegex = /^[A-Za-z0-9]+$/;
  if (!validSymbolRegex.test(symbol)) {
    return false;
  }
  
  return true;
}

/**
 * Validates a token description
 */
export function isValidTokenDescription(description: string): boolean {
  // Description should exist
  if (!description || description.trim() === '') {
    return false;
  }
  
  // Reasonable length limit
  if (description.length > 1000) {
    return false;
  }
  
  return true;
}

/**
 * Validates a token supply amount
 */
export function isValidTokenSupply(supply: number): boolean {
  // Supply must be positive
  if (supply <= 0) {
    return false;
  }
  
  // Check for reasonable limits - allow bigger supply than original
  if (supply > Number.MAX_SAFE_INTEGER) {
    return false;
  }
  
  // Must be a whole number
  if (!Number.isInteger(supply)) {
    return false;
  }
  
  return true;
}

/**
 * Validates token decimals
 */
export function isValidTokenDecimals(decimals: number): boolean {
  // Decimals must be in the valid range for Solana tokens
  return Number.isInteger(decimals) && decimals >= 0 && decimals <= 9;
}

/**
 * Validates an image file for token logo
 * @param file The image file
 * @param maxSize Maximum file size in bytes
 */
export function isValidTokenImage(file: File | null, maxSize: number = 500 * 1024): boolean {
  if (!file) {
    return false;
  }
  
  // Check file type
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    return false;
  }
  
  // Check file size based on provided max size
  if (file.size > maxSize) {
    return false;
  }
  
  return true;
}

/**
 * Formats a number with commas for display
 */
export function formatNumberWithCommas(number: number): string {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Validates the entire token form data
 * @returns string error message or null if valid
 */
export function validateTokenForm(formData: {
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  description: string;
  logo: File | null;
  largeImageSize?: boolean;
}): string | null {
  if (!isValidTokenName(formData.name)) {
    return "Token name is required and must be up to 32 alphanumeric characters";
  }
  
  if (!isValidTokenSymbol(formData.symbol)) {
    return "Token symbol is required and must be 2-10 alphanumeric characters";
  }
  
  if (!isValidTokenDescription(formData.description)) {
    return "Description is required and must be less than 1000 characters";
  }
  
  if (!isValidTokenDecimals(formData.decimals)) {
    return "Decimals must be a whole number between 0 and 9";
  }
  
  if (!isValidTokenSupply(formData.supply)) {
    return "Supply must be a positive whole number";
  }
  
  // Set the max size based on whether large image size is enabled
  const maxSize = formData.largeImageSize ? 10 * 1024 * 1024 : 500 * 1024;
  
  if (!isValidTokenImage(formData.logo, maxSize)) {
    const sizeInMB = maxSize / (1024 * 1024);
    return `Logo image is required (PNG or JPG, max ${sizeInMB}MB)`;
  }
  
  return null;
}