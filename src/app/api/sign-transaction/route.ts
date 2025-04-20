// src/app/api/sign-transaction/route.ts

import { NextRequest, NextResponse } from 'next/server';
import bs58 from 'bs58';
import {
  Transaction,
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  Connection,
  clusterApiUrl
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  AuthorityType,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint
} from "@solana/spl-token";
import { TOKEN_METADATA_PROGRAM_ID, SOLANA_NETWORK } from '@/config';

/**
 * Helper: serialize a UTF‑8 string with u32‑length prefix (LE)
 */
function serializeString(value: string): Uint8Array {
  const buffer = Buffer.from(value, "utf8");
  const length = Buffer.alloc(4);
  length.writeUInt32LE(buffer.length, 0);
  return Buffer.concat([length, buffer]);
}

/**
 * Helper: serialize metadata for Metaplex createMetadataAccountV3
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
  const nameBuff   = serializeString(data.name);
  const symbolBuff = serializeString(data.symbol);
  const uriBuff    = serializeString(data.uri);

  const feeBuff = Buffer.alloc(2);
  feeBuff.writeUInt16LE(data.sellerFeeBasisPoints, 0);

  let creatorsBuff: Buffer;
  if (!data.creators) {
    creatorsBuff = Buffer.from([0]);
  } else {
    const vec = Buffer.concat(
      data.creators.map(c => Buffer.concat([
        c.address.toBuffer(),
        Buffer.from([c.verified ? 1 : 0]),
        Buffer.from([c.share])
      ]))
    );
    const len = Buffer.alloc(4);
    len.writeUInt32LE(data.creators.length, 0);
    creatorsBuff = Buffer.concat([Buffer.from([1]), len, vec]);
  }

  const collectionBuff = data.collection
    ? Buffer.concat([
        Buffer.from([1]),
        new PublicKey(data.collection.key).toBuffer(),
        Buffer.from([data.collection.verified ? 1 : 0])
      ])
    : Buffer.from([0]);

  // we don't support uses or collectionDetails yet
  const usesBuff              = Buffer.from([0]);
  const collectionDetailsBuff = Buffer.from([0]);
  const isMutableBuff         = Buffer.from([data.isMutable ? 1 : 0]);

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
      includeFeeTx = false
    } = await request.json();

    if (!mintPrivateKey || !metadataUrl || !tokenName || !tokenSymbol || !payerPublicKey) {
      return NextResponse.json(
        { error: "Missing required transaction data" },
        { status: 400 }
      );
    }

    // Server‐side key (only used if revokeUpdate === true)
    const updateAuthorityPrivateKey = process.env.REVOKE_UPDATE_PRIVATE_KEY;
    if (revokeUpdate && !updateAuthorityPrivateKey) {
      console.error("REVOKE_UPDATE_PRIVATE_KEY not configured");
      return NextResponse.json(
        { error: "Update authority not configured on server" },
        { status: 500 }
      );
    }

    // Setup connection
    const network    = SOLANA_NETWORK === 'mainnet-beta' ? 'mainnet-beta' : 'devnet';
    const connection = new Connection(clusterApiUrl(network));

    // Mint keypair from client
    const mintSecret  = Buffer.from(mintPrivateKey, 'base64');
    const mintKeypair = Keypair.fromSecretKey(new Uint8Array(mintSecret));

    // Decide which keypair is the update authority
    let updateAuthorityKeypair: Keypair;
    if (revokeUpdate) {
      // use server‐side key
      const serverSecret = bs58.decode(updateAuthorityPrivateKey!);
      updateAuthorityKeypair = Keypair.fromSecretKey(serverSecret);
    } else {
      // use the mint keypair itself
      updateAuthorityKeypair = mintKeypair;
    }

    const payer = new PublicKey(payerPublicKey);

    // Build transaction
    const transaction = new Transaction();
    transaction.recentBlockhash = recentBlockhash;
    transaction.feePayer       = payer;

    // Optional fee transfer
    if (includeFeeTx && feeWalletPubkey && feeAmountInLamports > 0) {
      transaction.instructions.unshift(
        SystemProgram.transfer({
          fromPubkey: payer,
          toPubkey: new PublicKey(feeWalletPubkey),
          lamports: feeAmountInLamports,
        })
      );
    }

    // Rent‐exempt & account creation
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

    // Associated Token Account
    const ata = await getAssociatedTokenAddress(mintKeypair.publicKey, payer);
    transaction.add(
      createAssociatedTokenAccountInstruction(
        payer,
        ata,
        payer,
        mintKeypair.publicKey
      )
    );
    // Mint to ATA
    const mintAmount = BigInt(tokenSupply) * BigInt(10 ** tokenDecimals);
    transaction.add(
      createMintToInstruction(
        mintKeypair.publicKey,
        ata,
        payer,
        mintAmount
      )
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

    // Creators array
    let creators = null;
    if (hasCreators) {
      creators = [{ address: payer, verified: true, share: 100 }];
    }

    // Create Metadata instruction
    transaction.add({
      programId: metadataProgramId,
      keys: [
        { pubkey: metadataPDA, isSigner: false, isWritable: true },
        { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: false },
        { pubkey: payer, isSigner: true, isWritable: false },                // mint authority
        { pubkey: payer, isSigner: true, isWritable: false },                // payer
        { pubkey: updateAuthorityKeypair.publicKey, isSigner: true, isWritable: false }, // update authority
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
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

    // Optional revocations
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

    // Sign with server key ONLY if revoking update
    if (revokeUpdate) {
      console.log("Signing with server update authority:", updateAuthorityKeypair.publicKey.toString());
      transaction.partialSign(updateAuthorityKeypair);
    }

    // Always sign with mint keypair
    console.log("Signing with mint keypair:", mintKeypair.publicKey.toString());
    transaction.partialSign(mintKeypair);

    // Serialize (payer will sign in wallet)
    const serialized = transaction.serialize({ requireAllSignatures: false });
    const b64 = Buffer.from(serialized).toString('base64');

    return NextResponse.json({
      success: true,
      signedTransaction: b64,
      updateAuthority: updateAuthorityKeypair.publicKey.toString(),
      mintAddress: mintKeypair.publicKey.toString(),
    });
  } catch (error) {
    console.error("Error in sign-transaction:", error);
    return NextResponse.json(
      { error: `Failed to sign transaction: ${error instanceof Error ? error.message : error}` },
      { status: 500 }
    );
  }
}
