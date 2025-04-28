// src/services/token-service.ts
// Main orchestration of token creation process

import { WalletContextState } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { FormDataType, TokenResult } from "@/types/token";
import { SOLANA_NETWORK_FEE } from "@/config";
import { uploadImageToIPFS, uploadMetadataToIPFS } from "./ipfs-service";
import { getSolanaConnection, saveWalletPublicKey } from "./wallet-service";
import { createTokenServerSide } from "./token-creation/server-side-creation";
import { handleErrorWithCleanup } from "./pinata-cleanup";
import { FEE_CONSTANTS } from "./fee-service";

// Image size limits in bytes
const IMAGE_SIZE_LIMITS = {
  DEFAULT: 500 * 1024, // 500KB
  LARGE: 10 * 1024 * 1024, // 10MB
};

/**
 * Orchestrates token creation with a single transaction
 * Network fees are deducted from the fee recipient amount, so the user pays EXACTLY the displayed fee
 */
export async function createTokenWithMetadata(
  walletAdapter: WalletContextState,
  formData: FormDataType,
  totalFee: number,
  onProgress?: (step: number) => void
): Promise<TokenResult> {
  const { publicKey, connected } = walletAdapter;
  if (!connected || !publicKey) {
    throw new Error("Wallet not connected. Please connect your wallet first.");
  }
  const connection: Connection = getSolanaConnection();

  // Ensure public key is saved for IPFS naming
  saveWalletPublicKey(publicKey.toString());

  // Validate inputs
  if (!formData.logo) {
    throw new Error("Please upload a logo image");
  }
  if (!formData.name || formData.name.trim() === "") {
    throw new Error("Token name is required");
  }
  if (!formData.symbol || formData.symbol.trim() === "") {
    throw new Error("Token symbol is required");
  }
  if (!formData.description || formData.description.trim() === "") {
    throw new Error("Token description is required");
  }

  // Validate image size
  const maxImageSize = formData.largeImageSize ? IMAGE_SIZE_LIMITS.LARGE : IMAGE_SIZE_LIMITS.DEFAULT;
  if (formData.logo && formData.logo.size > maxImageSize) {
    if (formData.largeImageSize) {
      throw new Error(`Image size exceeds maximum limit of 10MB`);
    } else {
      throw new Error(`Image size exceeds maximum limit of 500KB. Enable large image size option for larger images.`);
    }
  }

  // Ensure minimum fee
  const minimumFeeInSOL = FEE_CONSTANTS.MINIMUM_FEE;
  if (totalFee < minimumFeeInSOL) {
    console.warn(
      `Fee is too low (${totalFee}), using minimum fee of ${minimumFeeInSOL} SOL`
    );
    totalFee = minimumFeeInSOL;
  }

  // Calculate the net fee after subtracting the Solana network fee
  const networkFee = SOLANA_NETWORK_FEE;
  const netFeeAmount = Math.max(totalFee - networkFee, 0);

  try {
    // STEP 0: IPFS image with unique name (now using {public_key}_{random_uuid}_image pattern)
    onProgress?.(0);
    const imageUrl = await uploadImageToIPFS(
      formData.logo,
      formData.name,
      formData.symbol
    );

    // STEP 1: IPFS metadata JSON (now using {public_key}_{random_uuid}_metadata pattern)
    onProgress?.(1);
    const metadataUrl = await uploadMetadataToIPFS({
      name: formData.name,
      symbol: formData.symbol,
      description: formData.description,
      image: imageUrl,
      creator: formData.creatorInfo ? formData.creatorName : "SolHype",
      showName: true,
      tokenInfo: {
        chain: "Solana",
        totalSupply: formData.supply,
        circulatingSupply: formData.supply,
        decimals: formData.decimals,
      },
      createdOn: "SolHype",
      // Add authorities status for initial metadata as well
      authorities: {
        mintRevoked: formData.revokeMint,
        freezeRevoked: formData.revokeFreeze,
        updateRevoked: formData.revokeUpdate,
      },
      ...(formData.socialLinks && {
        website: formData.website,
        twitter: formData.twitter,
        telegram: formData.telegram,
        discord: formData.discord,
      }),
    });

    // STEP 2: Server-side token creation for both flows
    onProgress?.(2);
    
    // We now use server-side creation for both flows
    // The useServerUpdateAuthority parameter determines which flow to use
    return createTokenServerSide(
      walletAdapter,
      connection,
      formData,
      metadataUrl,
      imageUrl,
      netFeeAmount,
      onProgress
    );
  } catch (error) {
    // Handle error with Pinata cleanup
    console.error("Error in token creation process:", error);
    
    // Enhance error message based on error type
    let errorMessage = "An error occurred during token creation.";
    
    if (error instanceof Error) {
      if (error.message.includes("403") || error.message.includes("Access forbidden")) {
        errorMessage = "RPC access error. The Solana network endpoint is currently unavailable or has reached its request limit. If you're using mainnet, please configure a paid RPC endpoint.";
      } else if (error.message.includes("429") || error.message.includes("Too many requests")) {
        errorMessage = "Rate limit exceeded. The RPC endpoint has too many requests. Please try again later or use a dedicated RPC endpoint.";
      } else if (error.message.includes("wallet") || error.message.includes("Wallet")) {
        errorMessage = error.message; // Keep wallet-related errors as is
      } else if (error.message.includes("balance") || error.message.includes("insufficient")) {
        errorMessage = "Insufficient SOL balance to complete this transaction. Please add more SOL to your wallet.";
      } else {
        errorMessage = error.message;
      }
    }
    
    await handleErrorWithCleanup(error);
    throw new Error(errorMessage);
  }
}