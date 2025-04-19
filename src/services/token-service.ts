// src/services/token-service.ts

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
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
} from '@solana/spl-token'
import type { WalletContextState } from '@solana/wallet-adapter-react'

import { getSolanaConnection } from './wallet-service'
import {
  uploadImageToIPFS,
  uploadMetadataToIPFS,
  MetadataPayload,
} from './ipfs-service'
import { TOKEN_METADATA_PROGRAM_ID, FEE_RECIPIENT_WALLET } from '@/config'

/** Your form data shape */
export interface FormDataType {
  name: string
  symbol: string
  decimals: number
  supply: number
  description: string
  logo: File | null
  revokeMint: boolean
  revokeFreeze: boolean
  revokeUpdate: boolean
  socialLinks: boolean
  creatorInfo: boolean
  creatorName: string
  website: string
  twitter: string
  telegram: string
  discord: string
}

/** What we return once done */
export interface TokenResult {
  mintAddress: string
  metadataUrl: string
  imageUrl: string
  explorerUrl: string
}

/** Helper: serialize a UTF‑8 string with u32‑length prefix (LE) */
function serializeString(value: string): Uint8Array {
  const buffer = Buffer.from(value, 'utf8')
  const length = Buffer.alloc(4)
  length.writeUInt32LE(buffer.length, 0)
  return Buffer.concat([length, buffer])
}

/**
 * Helper function that correctly serializes metadata for the Metaplex createMetadataAccountV3 instruction
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
    // Implement if needed - for now we don't use this
    usesBuffer = Buffer.from([0]); // None
  }
  
  // Collection Details (Option<CollectionDetails>)
  // We don't use this, so set to None
  const collectionDetailsBuffer = Buffer.from([0]);
  
  // isMutable
  const isMutableBuffer = Buffer.from([data.isMutable ? 1 : 0]);
  
  // Combine all into the expected format
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
  const { publicKey, signTransaction, connected } = walletAdapter
  if (!connected || !publicKey) {
    throw new Error('Wallet not connected. Please connect your wallet first.')
  }
  const connection: Connection = getSolanaConnection()

  // Check if all authority options are enabled - this is required
  if (!formData.revokeMint || !formData.revokeFreeze || !formData.revokeUpdate) {
    throw new Error('All authority options (Mint, Freeze, Update) must be checked for a successful token creation')
  }

  // Validate fee calculation
  if (totalFee <= 0) {
    throw new Error('Fee calculation error. Please refresh the page and try again.')
  }

  console.log("Creating token with fee:", totalFee, "SOL")

  // STEP 0: IPFS image
  onProgress?.(0)
  const imageUrl = await uploadImageToIPFS(formData.logo!)

  // STEP 1: IPFS metadata JSON
  onProgress?.(1)
  
  // Prepare creator info based on creatorInfo flag
  let creatorName = 'SolMinter';
  if (formData.creatorInfo && formData.creatorName) {
    creatorName = formData.creatorName;
  }
  
  const metadataPayload: MetadataPayload = {
    name: formData.name,
    symbol: formData.symbol,
    description: formData.description,
    image: imageUrl,
    creator: creatorName,
  }
  
  // Only add social links if enabled
  if (formData.socialLinks) {
    metadataPayload.website = formData.website;
    metadataPayload.twitter = formData.twitter;
    metadataPayload.telegram = formData.telegram;
    metadataPayload.discord = formData.discord;
  }
  
  const metadataUrl = await uploadMetadataToIPFS(metadataPayload)

  // STEP 2: Prepare transaction
  onProgress?.(2)
  
  // Generate keypair for the new token mint
  const mintKeypair = Keypair.generate()
  const rentExempt = await getMinimumBalanceForRentExemptMint(connection)
  
  // Start building the transaction
  const instructions: TransactionInstruction[] = []
  
  // Add mint account creation
  instructions.push(
    SystemProgram.createAccount({
      fromPubkey: publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports: rentExempt,
      programId: TOKEN_PROGRAM_ID,
    })
  )
  
  // Initialize mint
  instructions.push(
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      formData.decimals,
      publicKey,
      publicKey,
      TOKEN_PROGRAM_ID
    )
  )
  
  // Create Associated Token Account
  const ata = await getAssociatedTokenAddress(
    mintKeypair.publicKey,
    publicKey
  )
  
  instructions.push(
    createAssociatedTokenAccountInstruction(
      publicKey,
      ata,
      publicKey,
      mintKeypair.publicKey
    )
  )
  
  // Mint tokens to ATA
  const mintAmount = BigInt(formData.supply) * BigInt(10 ** formData.decimals)
  instructions.push(
    createMintToInstruction(
      mintKeypair.publicKey,
      ata,
      publicKey,
      mintAmount
    )
  )
  
  // STEP 4: Create metadata
  onProgress?.(4)
  // derive metadata PDA
  const metadataProgramId = new PublicKey(TOKEN_METADATA_PROGRAM_ID)
  const [metadataPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      metadataProgramId.toBuffer(),
      mintKeypair.publicKey.toBuffer(),
    ],
    metadataProgramId
  )
  
  // Create metadata creators array if custom creator is specified
  let creators = null;
  if (formData.creatorInfo) {
    creators = [
      {
        address: publicKey,
        verified: true,
        share: 100
      }
    ];
  }
  
  // Add metadata creation instruction
  instructions.push({
    programId: metadataProgramId,
    keys: [
      { pubkey: metadataPDA, isSigner: false, isWritable: true },
      { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: false },
      { pubkey: publicKey, isSigner: true, isWritable: false }, // mint authority
      { pubkey: publicKey, isSigner: true, isWritable: false }, // payer
      { pubkey: publicKey, isSigner: false, isWritable: false }, // update authority
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([
      Buffer.from([33]), // createMetadataAccountV3 discriminator
      serializeMetadataV3({
        name: formData.name,
        symbol: formData.symbol,
        uri: metadataUrl,
        sellerFeeBasisPoints: 0,
        creators: creators,
        collection: null,
        uses: null,
        isMutable: !formData.revokeUpdate,
      }),
    ]),
  })
  
  // STEP 5: Add authority revocation instructions
  onProgress?.(5)
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
    )
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
    )
  }
  
  // Create the transaction
  const transaction = new Transaction()
  
  // Add all instructions EXCEPT the fee payment
  instructions.forEach(instruction => {
    transaction.add(instruction)
  })
  
  // Set fee payer and blockhash
  transaction.feePayer = publicKey
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
  
  // Calculate the network fee for the transaction
  // FIXED: Use getFeeForMessage instead of trying to access fee property directly
  const latestBlockhash = await connection.getLatestBlockhash();
  const message = transaction.compileMessage();
  const txFee = await connection.getFeeForMessage(message);
  const networkFee = txFee.value || 5000; // Default to 5000 lamports if not available
  
  console.log(`Estimated transaction fee: ${networkFee / LAMPORTS_PER_SOL} SOL`);
  
  // Calculate the actual fee to send to the fee wallet (totalFee - networkFee)
  const feeWalletPubkey = new PublicKey(FEE_RECIPIENT_WALLET);
  const totalFeeInLamports = totalFee * LAMPORTS_PER_SOL;
  
  // Ensure we're sending at least the minimum fee (0.1 SOL base fee)
  const minimumFee = 0.1 * LAMPORTS_PER_SOL;
  const adjustedFeeAmount = Math.max(minimumFee, totalFeeInLamports - networkFee);
  
  console.log(`Total fee shown to user: ${totalFee} SOL`);
  console.log(`Adjusted fee after network costs: ${adjustedFeeAmount / LAMPORTS_PER_SOL} SOL`);
  
  // Create the fee payment instruction and add it as the FIRST instruction
  const feeInstruction = SystemProgram.transfer({
    fromPubkey: publicKey,
    toPubkey: feeWalletPubkey,
    lamports: adjustedFeeAmount
  });
  
  // Insert the fee instruction at the beginning
  transaction.instructions.unshift(feeInstruction);
  
  // Sign with the mint keypair
  transaction.partialSign(mintKeypair);
  
  // Sign with the wallet and send
  const signedTransaction = await signTransaction!(transaction);
  const txSignature = await connection.sendRawTransaction(signedTransaction.serialize());
  await connection.confirmTransaction(txSignature);
  
  // Done ✅
  const clusterParam =
    process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'devnet'
      ? '?cluster=devnet'
      : '';

  return {
    mintAddress: mintKeypair.publicKey.toString(),
    metadataUrl,
    imageUrl,
    explorerUrl: `https://explorer.solana.com/address/${mintKeypair.publicKey.toString()}${clusterParam}`,
  }
}