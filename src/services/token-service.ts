// src/services/token-service.ts
// Main orchestration of token creation process

import { WalletContextState } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { FormDataType, TokenResult } from "@/types/token";
import { SOLANA_NETWORK_FEE } from "@/config";
import { uploadImageToIPFS, uploadMetadataToIPFS } from "./ipfs-service";
import { getSolanaConnection, saveWalletPublicKey } from "./wallet-service";
import { createTokenClientSide } from "./token-creation/client-side-creation";
import { createTokenServerSide } from "./token-creation/server-side-creation";
import { handleErrorWithCleanup } from "./pinata-cleanup";

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

  // Ensure minimum fee
  const minimumFeeInSOL = 0.1;
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

    // STEP 2: Choose flow based on whether we need to revoke update authority
    onProgress?.(2);

    // Check whether to use server-side update authority (only when revoking update)
    if (formData.revokeUpdate) {
      return createTokenServerSide(
        walletAdapter,
        connection,
        formData,
        metadataUrl,
        imageUrl,
        netFeeAmount,
        onProgress
      );
    } else {
      return createTokenClientSide(
        walletAdapter,
        connection,
        formData,
        metadataUrl,
        imageUrl,
        netFeeAmount,
        onProgress
      );
    }
  } catch (error) {
    // Handle error with Pinata cleanup
    console.error("Error in token creation process:", error);
    await handleErrorWithCleanup(error);

    // Rethrow the error for the UI to handle
    throw error;
  }
}
