// src/services/token-creation/server-side-creation.ts
// Handles server-side token creation flow (when revokeUpdate is true)

import {
  Connection,
  Transaction,
  Keypair,
  LAMPORTS_PER_SOL,
  TransactionConfirmationStrategy,
} from "@solana/web3.js";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { FormDataType, TokenResult } from "@/types/token";
import { updateMetadataWithMintAddress } from "../ipfs-service";
import { handleErrorWithCleanup } from "../pinata-cleanup";

/**
 * Creates a token using server-side signing for update authority
 * Used when revokeUpdate is true
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
  const { publicKey, signTransaction } = walletAdapter;

  // Validate that publicKey and signTransaction are available
  if (!publicKey) {
    throw new Error("Public key is null. Wallet must be connected.");
  }

  if (!signTransaction) {
    throw new Error("Wallet does not support transaction signing");
  }

  try {
    // Generate mint keypair client-side
    const mintKeypair = Keypair.generate();
    const feeAmountInLamports = Math.floor(netFeeAmount * LAMPORTS_PER_SOL);
    const mintPrivateKey = Buffer.from(mintKeypair.secretKey).toString(
      "base64"
    );
    
    // Get latest blockhash with improved error handling
    let blockhash;
    try {
      const { blockhash: recentBlockhash } = await connection.getLatestBlockhash("finalized");
      blockhash = recentBlockhash;
    } catch (blockHashError) {
      console.error("Error getting recent blockhash:", blockHashError);
      throw new Error("Network communication error. Unable to get recent blockhash from Solana. Please check your RPC endpoint configuration.");
    }

    // Request server-side signing
    let response;
    try {
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
          payerPublicKey: publicKey.toString(), // Safe to call toString() now
          hasCreators: true, // IMPORTANT FIX: Always include creators
          revokeUpdate: formData.revokeUpdate,
          revokeMint: formData.revokeMint,
          revokeFreeze: formData.revokeFreeze,
          recentBlockhash: blockhash,
          feeWalletPubkey: process.env.NEXT_PUBLIC_FEE_WALLET,
          feeAmountInLamports,
          includeFeeTx: netFeeAmount > 0,
        }),
      });
    } catch (fetchError) {
      console.error("Network error during server signing request:", fetchError);
      throw new Error("Network error: Unable to communicate with the server for transaction signing. Please check your internet connection.");
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
        throw new Error(`Failed to sign transaction on server: ${errorText}`);
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

    // Properly handle wallet rejection
    let walletSignedTransaction;
    try {
      walletSignedTransaction = await signTransaction(transaction);
    } catch (walletError) {
      console.error("Wallet signature rejected by user:", walletError);
      // Handle the error with cleanup
      await handleErrorWithCleanup(
        new Error("Transaction was canceled by the user")
      );
      throw new Error("Transaction was canceled by the user");
    }

    if (!walletSignedTransaction) {
      // Handle the error with cleanup
      await handleErrorWithCleanup(new Error("Transaction signing failed"));
      throw new Error("Transaction signing failed");
    }

    // Send and confirm transaction
    let txSignature;
    try {
      txSignature = await connection.sendRawTransaction(
        walletSignedTransaction.serialize()
      );
      
      // Improved confirmation with proper typing
      const latestBlockHash = await connection.getLatestBlockhash("finalized");
      
      // Create a TransactionConfirmationStrategy object
      const confirmationStrategy: TransactionConfirmationStrategy = {
        signature: txSignature,
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight
      };
      
      // Confirm transaction with proper typing
      const confirmationResult = await connection.confirmTransaction(
        confirmationStrategy, 
        "confirmed"
      );
      
      if (confirmationResult.value.err) {
        throw new Error(`Transaction confirmed but failed: ${JSON.stringify(confirmationResult.value.err)}`);
      }
    } catch (sendError) {
      console.error("Error sending/confirming transaction:", sendError);
      
      // Add specific error handling for RPC errors during send
      if (sendError instanceof Error) {
        if (sendError.message.includes("403") || sendError.message.includes("forbidden")) {
          throw new Error("RPC access forbidden. Please check your RPC endpoint configuration for mainnet.");
        } else if (sendError.message.includes("429") || sendError.message.includes("Too many request")) {
          throw new Error("RPC rate limit exceeded. Please try again later or use a different RPC endpoint.");
        } else if (sendError.message.includes("timeout") || sendError.message.includes("timed out")) {
          throw new Error("Transaction confirmation timed out. The network may be congested or your RPC endpoint may be slow.");
        }
      }
      
      throw sendError;
    }

    onProgress?.(6);

    // Update metadata with mint address
    // Now using {public_key}_{token_key} naming pattern
    let updatedMetadataUrl;
    try {
      updatedMetadataUrl = await updateMetadataWithMintAddress(
        metadataUrl,
        mintAddress,
        formData,
        imageUrl // Pass the actual image URL
      );
    } catch (updateError) {
      console.error("Error updating metadata after successful token creation:", updateError);
      // Continue despite metadata update error - the token is still created
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
    console.error("Error in server-side update authority flow:", error);
    // Make sure to clean up Pinata files in case of an error
    await handleErrorWithCleanup(error);

    // Improved error messaging
    let errorMessage = "Failed to process transaction";
    
    if (error instanceof Error) {
      if (error.message.includes("403") || error.message.includes("Access forbidden")) {
        errorMessage = "RPC access error. The Solana network endpoint is unavailable or has reached its request limit. If you're using mainnet, please configure a paid RPC endpoint.";
      } else if (error.message.includes("429") || error.message.includes("Too many requests")) {
        errorMessage = "Rate limit exceeded. The RPC endpoint has too many requests. Please try again later or use a dedicated RPC endpoint.";
      } else if (error.message.includes("blockhash")) {
        errorMessage = "Network error retrieving latest blockhash. Please check your internet connection or RPC endpoint configuration.";
      } else if (error.message.includes("insufficient funds") || error.message.includes("0x1")) {
        errorMessage = "Insufficient SOL balance to complete the transaction. Please add more SOL to your wallet.";
      } else {
        errorMessage = error.message;
      }
    }
    
    throw new Error(errorMessage);
  }
}