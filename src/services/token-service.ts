// src/services/token-service.ts

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

import { getSolanaConnection } from "./wallet-service";
import {
  uploadImageToIPFS,
  uploadMetadataToIPFS,
  updateMetadataWithMintAddress,
  MetadataPayload,
} from "./ipfs-service";
import {
  TOKEN_METADATA_PROGRAM_ID,
  FEE_RECIPIENT_WALLET,
  SOLANA_NETWORK_FEE,
} from "@/config";
import { FormDataType } from "@/types/token";

/** What we return once done */
export interface TokenResult {
  mintAddress: string;
  metadataUrl: string;
  imageUrl: string;
  explorerUrl: string;
}

/** Helper: serialize a UTF‑8 string with u32‑length prefix (LE) */
function serializeString(value: string): Uint8Array {
  const buffer = Buffer.from(value, "utf8");
  const length = Buffer.alloc(4);
  length.writeUInt32LE(buffer.length, 0);
  return Buffer.concat([length, buffer]);
}

/**
 * Helper function that correctly serializes metadata for the
 * Metaplex createMetadataAccountV3 instruction
 */
function serializeMetadataV3(data: {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators: { address: PublicKey; verified: boolean; share: number }[] | null;
  collection: { key: string; verified: boolean } | null;
  uses: any | null;
  isMutable: boolean;
}): Uint8Array {
  // Name
  const nameBuffer = serializeString(data.name);
  // Symbol
  const symbolBuffer = serializeString(data.symbol);
  // URI
  const uriBuffer = serializeString(data.uri);
  // Seller fee basis points (u16)
  const sellerFeeBasisPointsBuffer = Buffer.alloc(2);
  sellerFeeBasisPointsBuffer.writeUInt16LE(data.sellerFeeBasisPoints, 0);

  // Creators (Option<Vec<Creator>>)
  let creatorsBuffer;
  if (data.creators === null) {
    creatorsBuffer = Buffer.from([0]); // None
  } else {
    const creatorsVec = Buffer.concat(
      data.creators.map((creator) => {
        const address = creator.address.toBuffer();
        const verified = Buffer.from([creator.verified ? 1 : 0]);
        const share = Buffer.from([creator.share]);
        return Buffer.concat([address, verified, share]);
      })
    );

    const creatorsLength = Buffer.alloc(4);
    creatorsLength.writeUInt32LE(data.creators.length, 0);

    creatorsBuffer = Buffer.concat([
      Buffer.from([1]), // Some
      creatorsLength,
      creatorsVec,
    ]);
  }

  // Collection (Option<Collection>)
  let collectionBuffer;
  if (data.collection === null) {
    collectionBuffer = Buffer.from([0]); // None
  } else {
    collectionBuffer = Buffer.concat([
      Buffer.from([1]), // Some
      new PublicKey(data.collection.key).toBuffer(),
      Buffer.from([data.collection.verified ? 1 : 0]),
    ]);
  }

  // Uses (Option<Uses>)
  let usesBuffer;
  if (data.uses === null) {
    usesBuffer = Buffer.from([0]); // None
  } else {
    usesBuffer = Buffer.from([0]); // None
  }

  // Collection Details (Option<CollectionDetails>)
  const collectionDetailsBuffer = Buffer.from([0]);

  // isMutable
  const isMutableBuffer = Buffer.from([data.isMutable ? 1 : 0]);

  return Buffer.concat([
    nameBuffer,
    symbolBuffer,
    uriBuffer,
    sellerFeeBasisPointsBuffer,
    creatorsBuffer,
    collectionBuffer,
    usesBuffer,
    collectionDetailsBuffer,
    isMutableBuffer,
  ]);
}

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
  const { publicKey, signTransaction, connected } = walletAdapter;
  if (!connected || !publicKey) {
    throw new Error("Wallet not connected. Please connect your wallet first.");
  }
  const connection: Connection = getSolanaConnection();

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

  console.log("Creating token with displayed fee:", totalFee, "SOL");
  console.log("Solana network fee:", networkFee, "SOL");
  console.log("Net fee to fee recipient:", netFeeAmount, "SOL");
  console.log("Token options:", {
    revokeMint: formData.revokeMint,
    revokeFreeze: formData.revokeFreeze,
    revokeUpdate: formData.revokeUpdate,
    socialLinks: formData.socialLinks,
    creatorInfo: formData.creatorInfo,
  });

  // STEP 0: IPFS image with unique name
  onProgress?.(0);
  const imageUrl = await uploadImageToIPFS(
    formData.logo,
    formData.name,
    formData.symbol
  );

  // STEP 1: IPFS metadata JSON
  onProgress?.(1);

  const metadataPayload: MetadataPayload = {
    name: formData.name,
    symbol: formData.symbol,
    description: formData.description,
    image: imageUrl,
    creator: formData.creatorInfo ? formData.creatorName : "SolMinter",
    showName: true,
    tokenInfo: {
      chain: "Solana",
      totalSupply: formData.supply,
      circulatingSupply: formData.supply,
      decimals: formData.decimals,
    },
    createdOn: "SolMinter",
    ...(formData.socialLinks && {
      website: formData.website,
      twitter: formData.twitter,
      telegram: formData.telegram,
      discord: formData.discord,
    }),
  };

  const metadataUrl = await uploadMetadataToIPFS(metadataPayload);

  // STEP 2: Prepare transaction
  onProgress?.(2);

  const mintKeypair = Keypair.generate();
  const rentExempt = await getMinimumBalanceForRentExemptMint(connection);

  // Check whether to use server-side update authority (only when revoking update)
  const useServerUpdateAuthority = formData.revokeUpdate;

  if (useServerUpdateAuthority) {
    // ─── Server‑side signing branch ────────────────────────────────────────────────────────────────
    try {
      const feeAmountInLamports = Math.floor(netFeeAmount * LAMPORTS_PER_SOL);
      const mintPrivateKey = Buffer.from(mintKeypair.secretKey).toString(
        "base64"
      );
      const { blockhash } = await connection.getLatestBlockhash();

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
          payerPublicKey: publicKey.toString(),
          hasCreators: formData.creatorInfo,
          revokeUpdate: formData.revokeUpdate,
          revokeMint: formData.revokeMint,
          revokeFreeze: formData.revokeFreeze,
          recentBlockhash: blockhash,
          feeWalletPubkey: FEE_RECIPIENT_WALLET,
          feeAmountInLamports,
          includeFeeTx: netFeeAmount > 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to sign transaction on server"
        );
      }

      const { signedTransaction, mintAddress } = await response.json();
      const transaction = Transaction.from(
        Buffer.from(signedTransaction, "base64")
      );

      console.log(
        "Transaction constructed and signed by server for update authority"
      );

      onProgress?.(3);

      // Properly handle wallet rejection here
      let walletSignedTransaction;
      try {
        walletSignedTransaction = await signTransaction!(transaction);
      } catch (walletError) {
        console.error("Wallet signature rejected by user:", walletError);
        throw new Error("Transaction was canceled by the user");
      }

      if (!walletSignedTransaction) {
        throw new Error("Transaction signing failed");
      }

      // Now that we have a properly signed transaction, send it
      const txSignature = await connection.sendRawTransaction(
        walletSignedTransaction.serialize()
      );
      await connection.confirmTransaction(txSignature);

      console.log("Transaction confirmed successfully!");
      onProgress?.(6);

      const updatedMetadataUrl = await updateMetadataWithMintAddress(
        metadataUrl,
        mintAddress,
        formData
      );
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
      throw new Error(
        `Failed to process transaction: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  } else {
    // ─── Client‑side flow branch ───────────────────────────────────────────────────────────────────
    try {
      const instructions: TransactionInstruction[] = [];
      const feeWalletPubkey = new PublicKey(FEE_RECIPIENT_WALLET);
      const feeAmountInLamports = Math.floor(netFeeAmount * LAMPORTS_PER_SOL);

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

      const mintAmount =
        BigInt(formData.supply) * BigInt(10 ** formData.decimals);
      instructions.push(
        createMintToInstruction(
          mintKeypair.publicKey,
          ata,
          publicKey,
          mintAmount
        )
      );

      onProgress?.(4);

      const metadataProgramId = new PublicKey(TOKEN_METADATA_PROGRAM_ID);
      const [metadataPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          metadataProgramId.toBuffer(),
          mintKeypair.publicKey.toBuffer(),
        ],
        metadataProgramId
      );

      let creators = null;
      if (formData.creatorInfo) {
        creators = [
          {
            address: publicKey,
            verified: true,
            share: 100,
          },
        ];
      }

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
            creators,
            collection: null,
            uses: null,
            isMutable: false, // immutable when revokeUpdate is off
          }),
        ]),
      });

      onProgress?.(5);
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

      const transaction = new Transaction();
      instructions.forEach((ix) => transaction.add(ix));
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      transaction.partialSign(mintKeypair);

      console.log("Sending transaction to wallet for approval...");
      const signedTransaction = await signTransaction!(transaction);
      const txSignature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      await connection.confirmTransaction(txSignature);

      const mintAddress = mintKeypair.publicKey.toString();
      onProgress?.(6);
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

      const clusterParam =
        process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet"
          ? "?cluster=devnet"
          : "";
      return {
        mintAddress,
        metadataUrl: finalMetadataUrl,
        imageUrl,
        explorerUrl: `https://explorer.solana.com/address/${mintAddress}${clusterParam}`,
      };
    } catch (error: unknown) {
      console.error("Transaction error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to process transaction: ${errorMessage}`);
    }
  }
}
