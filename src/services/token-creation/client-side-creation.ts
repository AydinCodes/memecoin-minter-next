// src/services/token-creation/client-side-creation.ts
// Handles client-side token creation flow (when revokeUpdate is false)

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  AuthorityType,
} from "@solana/spl-token";
import type { WalletContextState } from "@solana/wallet-adapter-react";

import { FormDataType, TokenResult } from "@/types/token";
import { TOKEN_METADATA_PROGRAM_ID, FEE_RECIPIENT_WALLET } from "@/config";
import { serializeMetadataV3 } from "./metadata-serializer";
import { updateMetadataWithMintAddress } from "../ipfs-service";

/**
 * Creates a token using client-side transaction flow
 * Used when revokeUpdate is false (no server-side update authority needed)
 */
export async function createTokenClientSide(
  walletAdapter: WalletContextState,
  connection: Connection,
  formData: FormDataType,
  metadataUrl: string,
  imageUrl: string,
  netFeeAmount: number,
  onProgress?: (step: number) => void
): Promise<TokenResult> {
  const { publicKey, signTransaction } = walletAdapter;
  
  // Validate that publicKey is not null before proceeding
  if (!publicKey) {
    throw new Error("Public key is null. Wallet must be connected.");
  }

  try {
    const mintKeypair = Keypair.generate();
    const rentExempt = await getMinimumBalanceForRentExemptMint(connection);

    const instructions: TransactionInstruction[] = [];
    const feeWalletPubkey = new PublicKey(FEE_RECIPIENT_WALLET);
    const feeAmountInLamports = Math.floor(netFeeAmount * LAMPORTS_PER_SOL);

    // Add fee transfer instruction if needed
    if (feeAmountInLamports > 0) {
      instructions.push(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: feeWalletPubkey,
          lamports: feeAmountInLamports,
        })
      );
    } else {
      console.log("Net fee is zero or negative, skipping fee transfer");
    }

    // Create and initialize mint account
    instructions.push(
      SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports: rentExempt,
        programId: TOKEN_PROGRAM_ID,
      })
    );
    
    instructions.push(
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        formData.decimals,
        publicKey,
        publicKey,
        TOKEN_PROGRAM_ID
      )
    );

    // Create associated token account and mint tokens
    const ata = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      publicKey
    );
    
    instructions.push(
      createAssociatedTokenAccountInstruction(
        publicKey,
        ata,
        publicKey,
        mintKeypair.publicKey
      )
    );
    
    const mintAmount = BigInt(formData.supply) * BigInt(10 ** formData.decimals);
    instructions.push(
      createMintToInstruction(
        mintKeypair.publicKey,
        ata,
        publicKey,
        mintAmount
      )
    );

    onProgress?.(4);

    // Create metadata
    const metadataProgramId = new PublicKey(TOKEN_METADATA_PROGRAM_ID);
    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        metadataProgramId.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
      ],
      metadataProgramId
    );

    // IMPORTANT FIX: Always include creators array with the user's wallet
    // This ensures the creator field is properly set in the Metaplex metadata
    const creators = [
      {
        address: publicKey,
        verified: true,
        share: 100,
      },
    ];

    // If custom creator info is enabled, we'll update the creator name in the URI metadata
    // but the on-chain Metaplex metadata should still have the actual wallet address
    
    instructions.push({
      programId: metadataProgramId,
      keys: [
        { pubkey: metadataPDA, isSigner: false, isWritable: true },
        { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: false },
        { pubkey: publicKey, isSigner: true, isWritable: false }, // mint authority
        { pubkey: publicKey, isSigner: true, isWritable: false }, // payer
        { pubkey: publicKey, isSigner: false, isWritable: false }, // update authority
        {
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      data: Buffer.concat([
        Buffer.from([33]), // createMetadataAccountV3 discriminator
        serializeMetadataV3({
          name: formData.name,
          symbol: formData.symbol,
          uri: metadataUrl,
          sellerFeeBasisPoints: 0,
          creators, // Always include creators array with user's wallet
          collection: null,
          uses: null,
          isMutable: false,
        }),
      ]),
    });

    onProgress?.(5);
    
    // Add authority revocation instructions if requested
    if (formData.revokeMint) {
      instructions.push(
        createSetAuthorityInstruction(
          mintKeypair.publicKey,
          publicKey,
          AuthorityType.MintTokens,
          null,
          [],
          TOKEN_PROGRAM_ID
        )
      );
    }
    
    if (formData.revokeFreeze) {
      instructions.push(
        createSetAuthorityInstruction(
          mintKeypair.publicKey,
          publicKey,
          AuthorityType.FreezeAccount,
          null,
          [],
          TOKEN_PROGRAM_ID
        )
      );
    }

    // Create and sign transaction
    const transaction = new Transaction();
    instructions.forEach((ix) => transaction.add(ix));
    transaction.feePayer = publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.partialSign(mintKeypair);

    console.log("Sending transaction to wallet for approval...");
    
    // Handle wallet rejection properly
    if (!signTransaction) {
      throw new Error("Wallet does not support transaction signing");
    }
    
    let signedTransaction;
    try {
      signedTransaction = await signTransaction(transaction);
    } catch (walletError) {
      console.error("Wallet signature rejected by user:", walletError);
      throw new Error("Transaction was canceled by the user");
    }
    
    if (!signedTransaction) {
      throw new Error("Transaction signing failed");
    }

    // Send and confirm transaction
    const txSignature = await connection.sendRawTransaction(signedTransaction.serialize());
    await connection.confirmTransaction(txSignature);

    const mintAddress = mintKeypair.publicKey.toString();
    onProgress?.(6);
    
    // Update metadata with mint address
    let finalMetadataUrl = metadataUrl;
    try {
      finalMetadataUrl = await updateMetadataWithMintAddress(
        metadataUrl,
        mintAddress,
        formData
      );
    } catch (updateError) {
      console.error("Error updating metadata (non-critical):", updateError);
    }

    const clusterParam = process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet" ? "?cluster=devnet" : "";
    
    return {
      mintAddress,
      metadataUrl: finalMetadataUrl,
      imageUrl,
      explorerUrl: `https://explorer.solana.com/address/${mintAddress}${clusterParam}`,
    };
  } catch (error: unknown) {
    console.error("Transaction error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to process transaction: ${errorMessage}`);
  }
}