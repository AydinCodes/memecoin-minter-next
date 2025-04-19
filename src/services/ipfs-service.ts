// src/services/ipfs-service.ts

/**
 * Service for handling IPFS uploads via Pinata
 */

import { FormDataType } from "@/types/token";

// Helper function to generate a unique file name based on token details + timestamp
function generateUniqueFileName(name: string, symbol: string): string {
  const timestamp = Date.now();
  const sanitizedName = name.replace(/[^a-z0-9]/gi, '').toLowerCase();
  const sanitizedSymbol = symbol.replace(/[^a-z0-9]/gi, '').toLowerCase();
  return `${sanitizedSymbol}_${sanitizedName}_${timestamp}`;
}

/**
 * Uploads an image file to IPFS via Pinata
 * @returns IPFS URL for the uploaded image
 */
export async function uploadImageToIPFS(file: File, tokenName: string, tokenSymbol: string): Promise<string> {
  try {
    // Generate a unique filename based on token symbol and name
    const uniqueFileName = generateUniqueFileName(tokenName, tokenSymbol);
    const fileExtension = file.name.split('.').pop() || 'png';
    const newFileName = `${uniqueFileName}.${fileExtension}`;
    
    // Create a new file with the unique name
    const uniqueFile = new File([file], newFileName, { type: file.type });
    
    // Create FormData to send to the API
    const formData = new FormData();
    formData.append('file', uniqueFile);
    
    // Add the unique filename as metadata
    formData.append('fileName', newFileName);
    
    console.log(`Uploading image as: ${newFileName}`);
    
    const res = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`Image upload failed: ${errorData.error || res.statusText}`);
    }

    const { cid, gateway } = await res.json();
    const imageUrl = `https://${gateway}/ipfs/${cid}`;
    
    console.log(`Image uploaded successfully: ${imageUrl}`);
    return imageUrl;
  } catch (error) {
    console.error("Error uploading image to IPFS:", error);
    throw error;
  }
}

export interface MetadataPayload {
  name: string;
  symbol: string;
  description: string;
  image: string;
  mint?: string; // Optional mint address (added after token creation)
  creator?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  // Additional fields from your non-Next.js implementation
  showName?: boolean;
  tokenInfo?: {
    chain: string;
    totalSupply: number;
    circulatingSupply: number;
    decimals: number;
  };
  createdOn?: string;
}

/**
 * Uploads token metadata to IPFS via Pinata
 * @returns IPFS URL for the uploaded metadata
 */
export async function uploadMetadataToIPFS(payload: MetadataPayload): Promise<string> {
  try {
    // Generate a unique filename for the metadata
    const uniqueFileName = generateUniqueFileName(payload.name, payload.symbol);
    
    // Construct the complete metadata object similar to your non-Next.js version
    const metadata: any = {
      // Core token information
      name: payload.name,
      symbol: payload.symbol,
      description: payload.description,
      image: payload.image,
      
      // Display preference
      showName: true,
      
      // Token information
      tokenInfo: {
        chain: "Solana",
        totalSupply: payload.tokenInfo?.totalSupply || 0,
        circulatingSupply: payload.tokenInfo?.circulatingSupply || 0,
        decimals: payload.tokenInfo?.decimals || 9
      },
      
      // Add mint address if available (could be added later)
      ...(payload.mint && { mint: payload.mint }),
      
      // Add creator if provided
      ...(payload.creator && { creator: payload.creator }),
      
      // Add social links if provided
      ...(payload.website && { website: payload.website }),
      ...(payload.twitter && { twitter: payload.twitter }),
      ...(payload.telegram && { telegram: payload.telegram }),
      ...(payload.discord && { discord: payload.discord }),
      
      // Origin
      createdOn: "SolMinter"
    };

    console.log(`Uploading metadata for: ${payload.name} (${payload.symbol})`);
    
    const res = await fetch('/api/upload-metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metadata,
        fileName: `${uniqueFileName}.json`
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`Metadata upload failed: ${errorData.error || res.statusText}`);
    }

    const { cid, gateway } = await res.json();
    const metadataUrl = `https://${gateway}/ipfs/${cid}`;
    
    console.log(`Metadata uploaded successfully: ${metadataUrl}`);
    return metadataUrl;
  } catch (error) {
    console.error("Error uploading metadata to IPFS:", error);
    throw error;
  }
}

/**
 * Update token metadata with mint address after token creation
 * @returns IPFS URL for the updated metadata
 */
export async function updateMetadataWithMintAddress(
  originalMetadataUrl: string, 
  mintAddress: string, 
  formData: FormDataType
): Promise<string> {
  try {
    // Create updated metadata payload with mint address
    const payload: MetadataPayload = {
      name: formData.name,
      symbol: formData.symbol,
      description: formData.description,
      image: originalMetadataUrl.split('/ipfs/')[0] + '/ipfs/' + originalMetadataUrl.split('/ipfs/')[1],
      mint: mintAddress,
      creator: formData.creatorInfo ? formData.creatorName : "SolMinter",
      tokenInfo: {
        chain: "Solana",
        totalSupply: formData.supply,
        circulatingSupply: formData.supply,
        decimals: formData.decimals
      }
    };
    
    // Add social links if enabled
    if (formData.socialLinks) {
      payload.website = formData.website || undefined;
      payload.twitter = formData.twitter || undefined;
      payload.telegram = formData.telegram || undefined;
      payload.discord = formData.discord || undefined;
    }
    
    // Upload the updated metadata
    return await uploadMetadataToIPFS(payload);
  } catch (error) {
    console.error("Error updating metadata with mint address:", error);
    throw error;
  }
}