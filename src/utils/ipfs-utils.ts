// src/utils/ipfs-utils.ts

/**
 * Utility functions for working with IPFS and Pinata
 */

/**
 * Extracts the CID from an IPFS URL
 */
export function extractCidFromUrl(ipfsUrl: string): string | null {
    try {
      if (ipfsUrl.includes('/ipfs/')) {
        // Format: https://gateway.domain/ipfs/CID
        return ipfsUrl.split('/ipfs/')[1];
      } else if (ipfsUrl.startsWith('ipfs://')) {
        // Format: ipfs://CID
        return ipfsUrl.replace('ipfs://', '');
      }
      return null;
    } catch (error) {
      console.error('Error extracting CID from URL:', error);
      return null;
    }
  }
  
  /**
   * Converts an IPFS URL to use a specific gateway
   */
  export function convertToGatewayUrl(
    ipfsUrl: string, 
    gateway: string = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud'
  ): string {
    const cid = extractCidFromUrl(ipfsUrl);
    if (!cid) return ipfsUrl; // Return original if we can't extract CID
    
    // Make sure gateway doesn't have protocol or trailing slash
    const cleanGateway = gateway.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `https://${cleanGateway}/ipfs/${cid}`;
  }
  
  /**
   * Logs IPFS operation details for debugging
   */
  export function logIpfsOperation(operation: string, details: any): void {
    console.log(`==== IPFS ${operation.toUpperCase()} ====`);
    console.table(details);
    console.log('==============================');
  }