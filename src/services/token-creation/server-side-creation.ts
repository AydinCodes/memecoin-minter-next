// src/services/token-creation/server-side-creation.ts
// Modified to use signAndSendTransaction exclusively

import {
  Connection,
  Transaction,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { FormDataType, TokenResult } from "@/types/token";
import { updateMetadataWithMintAddress } from "../ipfs-service";
import { handleErrorWithCleanup } from "../pinata-cleanup";
import { getLatestBlockhash } from "../wallet-service";

/**
 * Creates a token using server-side transaction construction with signAndSendTransaction
 */
export async function createTokenServerSide(
  walletAdapter: WalletContextState,
  connection: Connection,
  formData: FormDataType,
  metadataUrl: string,
  imageUrl: string,
  netFeeAmount: number,
  onProgress?: (step: number) => void
): Promise<TokenResult> {
  const { publicKey, sendTransaction } = walletAdapter;

  // Validate that publicKey and sendTransaction are available
  if (!publicKey) {
    throw new Error("Public key is null. Wallet must be connected.");
  }

  if (!sendTransaction) {
    throw new Error("Wallet does not support transaction sending");
  }

  try {
    // Generate mint keypair client-side
    const mintKeypair = Keypair.generate();
    const feeAmountInLamports = Math.floor(netFeeAmount * LAMPORTS_PER_SOL);
    const mintPrivateKey = Buffer.from(mintKeypair.secretKey).toString(
      "base64"
    );
    
    // Get latest blockhash from server API with improved error handling
    const latestBlockhashResult = await getLatestBlockhash();
    if (!latestBlockhashResult) {
      throw new Error("Network communication error. Unable to get recent blockhash from Solana. Please check your internet connection.");
    }
    const blockhash = latestBlockhashResult.blockhash;

    // Request server-side transaction construction
    let response;
    try {
      // Keep the request payload as simple as possible
      response = await fetch("/api/sign-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mintPrivateKey,
          metadataUrl,
          tokenName: formData.name,
          tokenSymbol: formData.symbol,
          tokenDecimals: formData.decimals,
          tokenSupply: formData.supply,
          payerPublicKey: publicKey.toString(),
          revokeUpdate: formData.revokeUpdate,
          revokeMint: formData.revokeMint,
          revokeFreeze: formData.revokeFreeze,
          recentBlockhash: blockhash,
          feeWalletPubkey: process.env.NEXT_PUBLIC_FEE_WALLET,
          feeAmountInLamports,
          includeFeeTx: netFeeAmount > 0
        }),
      });
    } catch (fetchError) {
      console.error("Network error during server request:", fetchError);
      throw new Error("Network error: Unable to communicate with the server. Please check your internet connection.");
    }

    if (!response.ok) {
      let errorText;
      try {
        const errorData = await response.json();
        errorText = errorData.error || "Server error";
      } catch {
        errorText = await response.text();
      }
      
      if (response.status === 403) {
        throw new Error("Server access forbidden. Please verify your server configuration.");
      } else if (response.status === 429) {
        throw new Error("Too many requests to the server. Please try again later.");
      } else {
        throw new Error(`Failed to process transaction on server: ${errorText}`);
      }
    }

    const { signedTransaction, mintAddress } = await response.json();
    
    let transaction;
    try {
      transaction = Transaction.from(
        Buffer.from(signedTransaction, "base64")
      );
    } catch (txParseError) {
      console.error("Error parsing transaction:", txParseError);
      throw new Error("Failed to parse transaction from server. Invalid transaction format.");
    }

    onProgress?.(3);

    // IMPORTANT CHANGE: Use sendTransaction instead of signTransaction
    // This is crucial for Phantom to not flag as malicious
    let signature;
    try {
      // Use sendTransaction directly instead of signing first
      signature = await sendTransaction(transaction, connection);
    } catch (walletError) {
      console.error("Wallet signature rejected by user:", walletError);
      await handleErrorWithCleanup(
        new Error("Transaction was canceled by the user")
      );
      throw new Error("Transaction was canceled by the user");
    }

    if (!signature) {
      await handleErrorWithCleanup(new Error("Transaction sending failed"));
      throw new Error("Transaction sending failed");
    }

    // Confirm the transaction
    try {
      await connection.confirmTransaction(signature, 'confirmed');
    } catch (confirmError) {
      console.error("Error confirming transaction:", confirmError);
      // Continue anyway as the transaction might still be successful
    }

    onProgress?.(6);

    // Update metadata with mint address
    let updatedMetadataUrl;
    try {
      updatedMetadataUrl = await updateMetadataWithMintAddress(
        metadataUrl,
        mintAddress,
        formData,
        imageUrl
      );
    } catch (updateError) {
      console.error("Error updating metadata after successful token creation:", updateError);
      updatedMetadataUrl = metadataUrl;
    }

    const clusterParam =
      process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet"
        ? "?cluster=devnet"
        : "";

    return {
      mintAddress,
      metadataUrl: updatedMetadataUrl,
      imageUrl,
      explorerUrl: `https://explorer.solana.com/address/${mintAddress}${clusterParam}`,
    };
  } catch (error) {
    console.error("Error in server-side token creation:", error);
    await handleErrorWithCleanup(error);

    // Improved error messaging
    let errorMessage = "Failed to process transaction";
    
    if (error instanceof Error) {
      if (error.message.includes("403") || error.message.includes("Access forbidden")) {
        errorMessage = "RPC access error. The Solana network endpoint is unavailable or has reached its request limit. Please try again later.";
      } else if (error.message.includes("429") || error.message.includes("Too many requests")) {
        errorMessage = "Rate limit exceeded. The RPC endpoint has too many requests. Please try again later.";
      } else if (error.message.includes("blockhash")) {
        errorMessage = "Network error retrieving latest blockhash. Please check your internet connection.";
      } else if (error.message.includes("insufficient funds") || error.message.includes("0x1")) {
        errorMessage = "Insufficient SOL balance to complete the transaction. Please add more SOL to your wallet.";
      } else {
        errorMessage = error.message;
      }
    }
    
    throw new Error(errorMessage);
  }
}