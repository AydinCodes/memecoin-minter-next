// src/app/api/sign-transaction/route.ts
// Modified for compatibility with Phantom's signAndSendTransaction

import { NextRequest, NextResponse } from "next/server";
import bs58 from "bs58";
import {
  Transaction,
  Keypair,
  PublicKey,
  SystemProgram,
  Connection,
  clusterApiUrl,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  AuthorityType,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";
import { TOKEN_METADATA_PROGRAM_ID, SOLANA_NETWORK } from "@/config";

/** Helper: serialize a UTF‑8 string with u32‑length prefix (LE) */
function serializeString(value: string): Uint8Array {
  const buffer = Buffer.from(value, "utf8");
  const length = Buffer.alloc(4);
  length.writeUInt32LE(buffer.length, 0);
  return Buffer.concat([length, buffer]);
}

/** Helper: serialize metadata for Metaplex createMetadataAccountV3 */
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
  const nameBuff = serializeString(data.name);
  const symbolBuff = serializeString(data.symbol);
  const uriBuff = serializeString(data.uri);

  const feeBuff = Buffer.alloc(2);
  feeBuff.writeUInt16LE(data.sellerFeeBasisPoints, 0);

  let creatorsBuff: Buffer;
  if (!data.creators) {
    creatorsBuff = Buffer.from([0]);
  } else {
    const vec = Buffer.concat(
      data.creators.map((c) =>
        Buffer.concat([
          c.address.toBuffer(),
          Buffer.from([c.verified ? 1 : 0]),
          Buffer.from([c.share]),
        ])
      )
    );
    const creatorsLength = Buffer.alloc(4);
    creatorsLength.writeUInt32LE(data.creators.length, 0);
    creatorsBuff = Buffer.concat([Buffer.from([1]), creatorsLength, vec]);
  }

  const collectionBuff = data.collection
    ? Buffer.concat([
        Buffer.from([1]),
        new PublicKey(data.collection.key).toBuffer(),
        Buffer.from([data.collection.verified ? 1 : 0]),
      ])
    : Buffer.from([0]);

  const usesBuff = Buffer.from([0]);
  const collectionDetailsBuff = Buffer.from([0]);
  const isMutableBuff = Buffer.from([data.isMutable ? 1 : 0]);

  return Buffer.concat([
    nameBuff,
    symbolBuff,
    uriBuff,
    feeBuff,
    creatorsBuff,
    collectionBuff,
    usesBuff,
    collectionDetailsBuff,
    isMutableBuff,
  ]);
}

export async function POST(request: NextRequest) {
  try {
    const {
      mintPrivateKey,
      metadataUrl,
      tokenName,
      tokenSymbol,
      tokenDecimals,
      tokenSupply,
      payerPublicKey,
      hasCreators,
      revokeUpdate,
      revokeMint,
      revokeFreeze,
      recentBlockhash,
      feeWalletPubkey,
      feeAmountInLamports,
      includeFeeTx = false,
    } = await request.json();

    // Validate required fields...
    if (
      !mintPrivateKey ||
      !metadataUrl ||
      !tokenName ||
      !tokenSymbol ||
      !payerPublicKey
    ) {
      return NextResponse.json(
        { error: "Missing required transaction data" },
        { status: 400 }
      );
    }

    // Server‐side update authority key - only needed when revoking update
    const updateAuthorityPrivateKey = process.env.REVOKE_UPDATE_PRIVATE_KEY;
    if (revokeUpdate && !updateAuthorityPrivateKey) {
      return NextResponse.json(
        { error: "Update authority not configured on server" },
        { status: 500 }
      );
    }

    // Use server-side RPC endpoints
    const network =
      SOLANA_NETWORK === "mainnet-beta" ? "mainnet-beta" : "devnet";
    let connectionUrl: string;

    if (network === "mainnet-beta" && process.env.SOLANA_MAINNET_RPC) {
      connectionUrl = process.env.SOLANA_MAINNET_RPC;
    } else if (network === "devnet" && process.env.SOLANA_DEVNET_RPC) {
      connectionUrl = process.env.SOLANA_DEVNET_RPC;
    } else {
      // Fall back to public endpoints if server-side RPCs not configured
      connectionUrl = clusterApiUrl(network);
    }

    const connection = new Connection(connectionUrl);

    // Reconstruct the mint keypair
    const mintSecret = Buffer.from(mintPrivateKey, "base64");
    const mintKeypair = Keypair.fromSecretKey(new Uint8Array(mintSecret));

    const payer = new PublicKey(payerPublicKey);

    // Build the transaction with extra space for Phantom's guard instructions
    // This is crucial for signAndSendTransaction to work without errors
    // Create transaction with a dummy instruction that will be removed later
    // This reserves space for Phantom's instructions
    const transaction = new Transaction();
    transaction.recentBlockhash = recentBlockhash;
    transaction.feePayer = payer;

    // Reserve space for Phantom's Lighthouse guard instructions
    // by adding some dummy signature fields
    const dummyKey = Keypair.generate().publicKey;
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: dummyKey,
        lamports: 0,
      })
    );

    // We'll remove this dummy instruction later
    const dummyInstruction = transaction.instructions[0];

    // Optional fee transfer
    if (includeFeeTx && feeWalletPubkey && feeAmountInLamports > 0) {
      console.log(
        `Adding fee transaction of ${feeAmountInLamports} lamports to ${feeWalletPubkey}`
      );
      transaction.instructions.push(
        SystemProgram.transfer({
          fromPubkey: payer,
          toPubkey: new PublicKey(feeWalletPubkey),
          lamports: feeAmountInLamports,
        })
      );
    }

    // Rent‐exempt mint account creation & initialization
    const rentExempt = await getMinimumBalanceForRentExemptMint(connection);
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: payer,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports: rentExempt,
        programId: TOKEN_PROGRAM_ID,
      })
    );
    transaction.add(
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        tokenDecimals,
        payer,
        payer,
        TOKEN_PROGRAM_ID
      )
    );

    // Associated Token Account & minting
    const ata = await getAssociatedTokenAddress(mintKeypair.publicKey, payer);
    transaction.add(
      createAssociatedTokenAccountInstruction(
        payer,
        ata,
        payer,
        mintKeypair.publicKey
      )
    );
    const mintAmount = BigInt(tokenSupply) * BigInt(10 ** tokenDecimals);
    transaction.add(
      createMintToInstruction(mintKeypair.publicKey, ata, payer, mintAmount)
    );

    // Metadata PDA
    const metadataProgramId = new PublicKey(TOKEN_METADATA_PROGRAM_ID);
    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        metadataProgramId.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
      ],
      metadataProgramId
    );

    // Handle the two different cases
    if (revokeUpdate) {
      // ===== CASE 1: revokeUpdate = true =====
      // Get the server's update authority keypair
      const serverSecret = bs58.decode(updateAuthorityPrivateKey!);
      const updateAuthorityKeypair = Keypair.fromSecretKey(serverSecret);
      const updateAuthorityPublicKey = updateAuthorityKeypair.publicKey;

      // Creators with verified = false
      const creators = [
        {
          address: payer,
          verified: false,
          share: 100,
        },
      ];

      // Metadata instruction with server as update authority signer
      transaction.add({
        programId: metadataProgramId,
        keys: [
          { pubkey: metadataPDA, isSigner: false, isWritable: true },
          { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: false },
          { pubkey: payer, isSigner: true, isWritable: false }, // mint authority
          { pubkey: payer, isSigner: true, isWritable: false }, // payer
          {
            pubkey: updateAuthorityPublicKey,
            isSigner: true,
            isWritable: false,
          }, // update authority with server
          {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
          },
        ],
        data: Buffer.concat([
          Buffer.from([33]), // createMetadataAccountV3 discriminator
          serializeMetadataV3({
            name: tokenName,
            symbol: tokenSymbol,
            uri: metadataUrl,
            sellerFeeBasisPoints: 0,
            creators,
            collection: null,
            uses: null,
            isMutable: !revokeUpdate,
          }),
        ]),
      });

      // Now remove the dummy instruction
      transaction.instructions = transaction.instructions.filter(
        (instr) => instr !== dummyInstruction
      );

      // Sign with the server's update authority keypair
      transaction.partialSign(updateAuthorityKeypair);

      // Always sign with the mint keypair
      transaction.partialSign(mintKeypair);

      // Serialize and return for wallet to sign & send
      const serialized = transaction.serialize({ requireAllSignatures: false });
      const b64 = Buffer.from(serialized).toString("base64");

      return NextResponse.json({
        success: true,
        signedTransaction: b64,
        updateAuthority: updateAuthorityPublicKey.toString(),
        mintAddress: mintKeypair.publicKey.toString(),
      });
    } else {
      // ===== CASE 2: revokeUpdate = false =====
      // Based on the client-side version that was working

      // Create metadata using the exact pattern that worked in client-side
      // Creators with verified = true when wallet is update authority
      const creators = [
        {
          address: payer,
          verified: true, // Set to true when wallet is update authority
          share: 100,
        },
      ];

      // Metadata instruction with payer as update authority but NOT a signer in that role
      transaction.add({
        programId: metadataProgramId,
        keys: [
          { pubkey: metadataPDA, isSigner: false, isWritable: true },
          { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: false },
          { pubkey: payer, isSigner: true, isWritable: false }, // mint authority
          { pubkey: payer, isSigner: true, isWritable: false }, // payer
          { pubkey: payer, isSigner: false, isWritable: false }, // update authority - not a signer!
          {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
          },
        ],
        data: Buffer.concat([
          Buffer.from([33]), // createMetadataAccountV3 discriminator
          serializeMetadataV3({
            name: tokenName,
            symbol: tokenSymbol,
            uri: metadataUrl,
            sellerFeeBasisPoints: 0,
            creators,
            collection: null,
            uses: null,
            isMutable: false, // Hardcode to false as per client-side
          }),
        ]),
      });

      // Optional authority revocations
      if (revokeMint) {
        transaction.add(
          createSetAuthorityInstruction(
            mintKeypair.publicKey,
            payer,
            AuthorityType.MintTokens,
            null,
            [],
            TOKEN_PROGRAM_ID
          )
        );
      }
      if (revokeFreeze) {
        transaction.add(
          createSetAuthorityInstruction(
            mintKeypair.publicKey,
            payer,
            AuthorityType.FreezeAccount,
            null,
            [],
            TOKEN_PROGRAM_ID
          )
        );
      }

      // Now remove the dummy instruction
      transaction.instructions = transaction.instructions.filter(
        (instr) => instr !== dummyInstruction
      );

      // Always sign with the mint keypair
      transaction.partialSign(mintKeypair);

      // Serialize and return for wallet to sign & send
      const serialized = transaction.serialize({ requireAllSignatures: false });
      const b64 = Buffer.from(serialized).toString("base64");

      return NextResponse.json({
        success: true,
        signedTransaction: b64,
        updateAuthority: payer.toString(),
        mintAddress: mintKeypair.publicKey.toString(),
      });
    }
  } catch (error) {
    console.error("Error in sign-transaction:", error);
    return NextResponse.json(
      {
        error: `Failed to sign transaction: ${
          error instanceof Error ? error.message : error
        }`,
      },
      { status: 500 }
    );
  }
}
