// src/utils/token-utils.ts

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
    
    // Check for invalid characters
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
    if (symbol.length < 2 || symbol.length > 10) {
      return false;
    }
    
    // Most token symbols are uppercase alphanumeric
    const validSymbolRegex = /^[A-Z0-9]+$/;
    if (!validSymbolRegex.test(symbol)) {
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
    
    // Check for reasonable limits
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
   * Formats a number with commas for display
   */
  export function formatNumberWithCommas(number: number): string {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  
  /**
   * Formats a wallet address for display 
   */
  export function formatWalletAddress(address: string): string {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }
  
  /**
   * Generates a token explorer URL
   */
  export function getTokenExplorerUrl(tokenAddress: string, network: string = 'devnet'): string {
    return `https://explorer.solana.com/address/${tokenAddress}${network === 'devnet' ? '?cluster=devnet' : ''}`;
  }