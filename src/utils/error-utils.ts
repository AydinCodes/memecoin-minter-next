// src/utils/error-utils.ts

/**
 * Formats Solana errors into user-friendly messages
 */
export function formatSolanaError(error: any): string {
    // If it's already a string, just return it
    if (typeof error === 'string') return error;
    
    // Extract error message from Error object
    const errorMessage = error.message || 'Unknown error occurred';
    
    // Handle specific Solana error messages
    if (errorMessage.includes('0x1')) {
      return 'Insufficient funds for transaction. Please make sure you have enough SOL to cover the fees.';
    }
    
    if (errorMessage.includes('Blockhash not found')) {
      return 'Network congestion detected. Please try again in a few moments.';
    }
    
    if (errorMessage.includes('Transaction simulation failed')) {
      return 'Transaction simulation failed. This could be due to network congestion or insufficient SOL.';
    }
    
    if (errorMessage.includes('User rejected')) {
      return 'Transaction was rejected by wallet. You must approve the transaction to continue.';
    }
    
      // Handle wallet connection errors
    if (errorMessage.includes('wallet disconnected') || errorMessage.includes('wallet not connected')) {
      return 'Wallet disconnected. Please reconnect your wallet and try again.';
    }
    
    if (errorMessage.includes('timeout')) {
      return 'Transaction timed out. The Solana network might be congested, please try again.';
    }
    
    // Handle metadata errors
    if (errorMessage.includes('metadata')) {
      return 'Error with token metadata. Please ensure your token information is valid.';
    }
    
    // Handle Pinata/IPFS errors
    if (errorMessage.includes('Pinata') || errorMessage.includes('IPFS')) {
      return 'Error uploading to IPFS. Please try again or check if your image file is valid.';
    }
  
    // Fall back to the original error message
    return errorMessage;
  }
  
  /**
   * Logs detailed error information
   */
  export function logError(error: any, context: string): void {
    console.error(`Error in ${context}:`, error);
    
    // Log additional information if available
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    
    if (error.stack) {
      console.error(`Stack trace: ${error.stack}`);
    }
    
    // For Solana-specific errors
    if (error.logs) {
      console.error('Solana logs:', error.logs);
    }
  }
  
  /**
   * Creates a user-friendly error message for validation errors
   */
  export function getValidationErrorMessage(field: string, message: string): string {
    return `${field}: ${message}`;
  }
  
  /**
   * Checks common token validation rules
   */
  export function validateTokenData(data: {
    name: string;
    symbol: string;
    decimals: number;
    supply: number;
  }): string | null {
    if (!data.name || data.name.trim() === '') {
      return 'Token name is required';
    }
    
    if (data.name.length > 32) {
      return 'Token name must be 32 characters or less';
    }
    
    if (!data.symbol || data.symbol.trim() === '') {
      return 'Token symbol is required';
    }
    
    if (data.symbol.length > 10) {
      return 'Token symbol must be 10 characters or less';
    }
    
    if (data.decimals < 0 || data.decimals > 18) {
      return 'Decimals must be between 0 and 18';
    }
    
    if (data.supply <= 0) {
      return 'Supply must be greater than 0';
    }
    
    if (data.supply > Number.MAX_SAFE_INTEGER) {
      return 'Supply is too large';
    }
    
    return null;
  }