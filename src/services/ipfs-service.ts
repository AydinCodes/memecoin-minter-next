// src/services/ipfs-service.ts

/**
 * Service for handling IPFS uploads via Pinata
 */

import { FormDataType } from "@/types/token";
import { v4 as uuidv4 } from "uuid"; // Need to add this dependency
import { setCurrentSessionUuid } from "./pinata-cleanup";

// Store the current UUID for the token creation session
let currentSessionUuid: string | null = null;

// Helper function to get the current wallet's public key
function getCurrentWalletPublicKey(): string {
  // Check if we're in a browser environment and window is defined
  if (typeof window !== "undefined") {
    // Try to get the public key from local storage if it's been saved there
    const savedPublicKey = localStorage.getItem("walletPublicKey");
    if (savedPublicKey) {
      return savedPublicKey;
    }
  }
  // Fallback if we can't get the actual public key
  return "unknown_wallet";
}

// Helper function to get the current session UUID or create a new one
function getSessionUuid(): string {
  if (!currentSessionUuid) {
    currentSessionUuid = uuidv4();
    console.log(`Created new session UUID: ${currentSessionUuid}`);

    // Sync with cleanup service
    setCurrentSessionUuid(currentSessionUuid);
  }
  return currentSessionUuid;
}

// Helper function to reset the session UUID (call this at the start of a new token creation)
export function resetSessionUuid(): void {
  currentSessionUuid = null;
  console.log("Reset session UUID for new token creation");

  // Sync with cleanup service
  setCurrentSessionUuid(null);
}

// Helper function to generate a unique file name based on wallet, UUID, and type
function generateUniqueFileName(
  type: "image" | "metadata" | "final_metadata",
  tokenKey?: string
): string {
  const walletPublicKey = getCurrentWalletPublicKey();

  // For the initial uploads, use the same UUID for both image and metadata
  if (type === "image" || type === "metadata") {
    // Use the current session UUID
    const uuid = getSessionUuid();

    if (type === "image") {
      return `${walletPublicKey}_${uuid}_image`;
    } else {
      return `${walletPublicKey}_${uuid}_metadata`;
    }
  }

  // For the final metadata after minting, use the token key
  if (type === "final_metadata" && tokenKey) {
    return `${walletPublicKey}_${tokenKey}`;
  }

  // Fallback name with timestamp
  const timestamp = Date.now();
  return `${walletPublicKey}_${timestamp}_${type}`;
}

/**
 * Uploads an image file to IPFS via Pinata
 * @returns IPFS URL for the uploaded image
 */
export async function uploadImageToIPFS(
  file: File,
  tokenName: string,
  tokenSymbol: string
): Promise<string> {
  try {
    // Reset the session UUID at the start of a new token creation
    resetSessionUuid();

    // Generate a unique filename using our new naming convention
    const uniqueFileName = generateUniqueFileName("image");
    const fileExtension = file.name.split(".").pop() || "png";
    const newFileName = `${uniqueFileName}.${fileExtension}`;

    // Create a new file with the unique name
    const uniqueFile = new File([file], newFileName, { type: file.type });

    // Create FormData to send to the API
    const formData = new FormData();
    formData.append("file", uniqueFile);

    // Add the unique filename as metadata
    formData.append("fileName", newFileName);

    console.log(`Uploading image as: ${newFileName}`);

    const res = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        `Image upload failed: ${errorData.error || res.statusText}`
      );
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
  // New metadata fields for authority status
  authorities?: {
    mintRevoked: boolean;
    freezeRevoked: boolean;
    updateRevoked: boolean;
  };
  sessionUuid?: string | null | undefined;
}

/**
 * Uploads token metadata to IPFS via Pinata
 * @returns IPFS URL for the uploaded metadata
 */
export async function uploadMetadataToIPFS(
  payload: MetadataPayload
): Promise<string> {
  try {
    // Generate a unique filename based on our new naming convention
    // This will use the same UUID as the image since we're using the session UUID
    const uniqueFileName = generateUniqueFileName("metadata");

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
        decimals: payload.tokenInfo?.decimals || 9,
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
      createdOn: "SolMinter",

      // Add authority status if provided
      ...(payload.authorities && { authorities: payload.authorities }),

      // Add the session UUID for debugging and file cleanup
      sessionUuid: getSessionUuid(),
    };

    console.log(
      `Uploading metadata for: ${payload.name} (${payload.symbol}) as ${uniqueFileName}`
    );

    const res = await fetch("/api/upload-metadata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metadata,
        fileName: `${uniqueFileName}.json`,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        `Metadata upload failed: ${errorData.error || res.statusText}`
      );
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
// Here's the fix for the updateMetadataWithMintAddress function:

export async function updateMetadataWithMintAddress(
  originalMetadataUrl: string,
  mintAddress: string,
  formData: FormDataType,
  imageUrl: string // Add imageUrl parameter to ensure we use the correct image URL
): Promise<string> {
  try {
    // Create updated metadata payload with mint address and use the token key in the filename
    const payload: MetadataPayload = {
      name: formData.name,
      symbol: formData.symbol,
      description: formData.description,
      image: imageUrl, // Use the actual image URL instead of the metadata URL
      mint: mintAddress,
      creator: formData.creatorInfo ? formData.creatorName : "SolMinter",
      tokenInfo: {
        chain: "Solana",
        totalSupply: formData.supply,
        circulatingSupply: formData.supply,
        decimals: formData.decimals,
      },
      // Add authority status information
      authorities: {
        mintRevoked: formData.revokeMint,
        freezeRevoked: formData.revokeFreeze,
        updateRevoked: formData.revokeUpdate,
      },
      // Include the original session UUID for tracking
      sessionUuid: currentSessionUuid || "unknown",
    };

    // Add social links if enabled
    if (formData.socialLinks) {
      payload.website = formData.website || undefined;
      payload.twitter = formData.twitter || undefined;
      payload.telegram = formData.telegram || undefined;
      payload.discord = formData.discord || undefined;
    }

    // Generate the final metadata filename using the token mint address
    const uniqueFileName = generateUniqueFileName(
      "final_metadata",
      mintAddress
    );

    // Upload the updated metadata with the new filename
    const res = await fetch("/api/upload-metadata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metadata: payload,
        fileName: `${uniqueFileName}.json`,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        `Updated metadata upload failed: ${errorData.error || res.statusText}`
      );
    }

    const { cid, gateway } = await res.json();
    const metadataUrl = `https://${gateway}/ipfs/${cid}`;

    console.log(
      `Updated metadata uploaded successfully as ${uniqueFileName}: ${metadataUrl}`
    );

    // Reset the session UUID after the token is fully created
    resetSessionUuid();

    return metadataUrl;
  } catch (error) {
    console.error("Error updating metadata with mint address:", error);
    throw error;
  }
}

/**
 * Gets the current session UUID
 * Useful for cleanup operations
 */
export function getCurrentSessionUuid(): string | null {
  return currentSessionUuid;
}
