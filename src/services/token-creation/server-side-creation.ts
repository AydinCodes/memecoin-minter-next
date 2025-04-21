// src/services/token-creation/server-side-creation.ts
// Handles server-side token creation flow (when revokeUpdate is true)

import { Connection, Transaction, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
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
    const mintPrivateKey = Buffer.from(mintKeypair.secretKey).toString("base64");
    const { blockhash } = await connection.getLatestBlockhash();

    // Request server-side signing
    const response = await fetch("/api/sign-transaction", {
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to sign transaction on server");
    }

    const { signedTransaction, mintAddress } = await response.json();
    const transaction = Transaction.from(Buffer.from(signedTransaction, "base64"));
    console.log("Transaction constructed and signed by server for update authority");

    onProgress?.(3);

    // Properly handle wallet rejection
    let walletSignedTransaction;
    try {
      walletSignedTransaction = await signTransaction(transaction);
    } catch (walletError) {
      console.error("Wallet signature rejected by user:", walletError);
      // Handle the error with cleanup
      await handleErrorWithCleanup(new Error("Transaction was canceled by the user"));
      throw new Error("Transaction was canceled by the user");
    }

    if (!walletSignedTransaction) {
      // Handle the error with cleanup
      await handleErrorWithCleanup(new Error("Transaction signing failed"));
      throw new Error("Transaction signing failed");
    }

    // Send and confirm transaction
    const txSignature = await connection.sendRawTransaction(walletSignedTransaction.serialize());
    await connection.confirmTransaction(txSignature);
    console.log("Transaction confirmed successfully!");
    
    onProgress?.(6);

    // Update metadata with mint address
    // Now using {public_key}_{token_key} naming pattern
    const updatedMetadataUrl = await updateMetadataWithMintAddress(
      metadataUrl,
      mintAddress,
      formData
    );
    
    const clusterParam = process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet" ? "?cluster=devnet" : "";

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
    
    throw new Error(
      `Failed to process transaction: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}