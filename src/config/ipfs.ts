// src/config/ipfs.ts

/**
 * Configuration for IPFS and Pinata services
 */

// IPFS Gateway configuration
export const IPFS_CONFIG = {
    // Default gateway to use (fallback if environment variable is not set)
    DEFAULT_GATEWAY: 'gateway.pinata.cloud',
    
    // The gateway to use from environment variables or fallback
    GATEWAY: process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud',
    
    // Whether we have proper Pinata credentials (JWT token)
    HAS_PINATA_CREDENTIALS: !!process.env.PINATA_JWT,
    
    // Pinata API endpoints
    PINATA_API: {
      UPLOAD_FILE: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
      UPLOAD_JSON: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      REMOVE_PIN: 'https://api.pinata.cloud/pinning/unpin',
    },
    
    // Default pin policy for geographical redundancy
    DEFAULT_PIN_POLICY: {
      regions: [
        {
          id: 'FRA1',
          desiredReplicationCount: 1
        },
        {
          id: 'NYC1',
          desiredReplicationCount: 1
        }
      ]
    }
  };
  
  /**
   * Get the complete IPFS URL with gateway
   * @param cid The IPFS CID
   * @returns Full gateway URL
   */
  export function getIpfsUrl(cid: string): string {
    return `https://${IPFS_CONFIG.GATEWAY}/ipfs/${cid}`;
  }
  
  /**
   * Check if we have proper Pinata credentials
   */
  export function hasPinataCredentials(): boolean {
    return IPFS_CONFIG.HAS_PINATA_CREDENTIALS;
  }