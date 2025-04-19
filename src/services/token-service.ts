// src/services/token-service.ts

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
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
import { calculateFee } from './fee-service'
import { TOKEN_METADATA_PROGRAM_ID } from '@/config'

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
  const buf = Buffer.from(value, 'utf8')
  const len = Buffer.alloc(4)
  len.writeUInt32LE(buf.length, 0)
  return Buffer.concat([len, buf])
}

/**
 * Helper: build the metadata bytes for createMetadataAccountV3
 * (instruction discriminator = 33)
 */
function serializeMetadataV3(data: {
  name: string
  symbol: string
  uri: string
  sellerFeeBasisPoints: number
  creators: null
  collection: null
  uses: null
  isMutable: boolean
}): Uint8Array {
  const nameB = serializeString(data.name)
  const symbolB = serializeString(data.symbol)
  const uriB = serializeString(data.uri)

  // seller fee (u16 little‑endian)
  const feeBuf = Buffer.alloc(2)
  feeBuf.writeUInt16LE(data.sellerFeeBasisPoints, 0)

  // creators = None
  const creatorsBuf = Buffer.from([0])

  // collection = None
  const collectionBuf = Buffer.from([0])

  // uses = None
  const usesBuf = Buffer.from([0])

  // collectionDetails = None
  const colDetailsBuf = Buffer.from([0])

  // isMutable
  const mutBuf = Buffer.from([data.isMutable ? 1 : 0])

  return Buffer.concat([
    nameB,
    symbolB,
    uriB,
    feeBuf,
    creatorsBuf,
    collectionBuf,
    usesBuf,
    colDetailsBuf,
    mutBuf,
  ])
}

/**
 * Orchestrates:
 * 0: IPFS image
 * 1: IPFS metadata JSON
 * 2: feature‐fee transfer
 * 3: create mint + ATA + mintTo
 * 4: create on‑chain metadata
 * 5: revoke authorities
 */
export async function createTokenWithMetadata(
  walletAdapter: WalletContextState,
  formData: FormDataType,
  onProgress?: (step: number) => void
): Promise<TokenResult> {
  const { publicKey, signTransaction, connected } = walletAdapter
  if (!connected || !publicKey) {
    throw new Error('Wallet not connected. Please connect your wallet first.')
  }
  const connection: Connection = getSolanaConnection()

  // STEP 0: IPFS image
  onProgress?.(0)
  const imageUrl = await uploadImageToIPFS(formData.logo!)

  // STEP 1: IPFS metadata JSON
  onProgress?.(1)
  const metadataPayload: MetadataPayload = {
    name: formData.name,
    symbol: formData.symbol,
    description: formData.description,
    image: imageUrl,
    website: formData.website,
    twitter: formData.twitter,
    telegram: formData.telegram,
    discord: formData.discord,
  }
  const metadataUrl = await uploadMetadataToIPFS(metadataPayload)

  // STEP 2: feature‐fee transfer
  onProgress?.(2)
  const feeSOL = calculateFee({
    revokeMint: formData.revokeMint,
    revokeFreeze: formData.revokeFreeze,
    revokeUpdate: formData.revokeUpdate,
    socialLinks: formData.socialLinks,
    creatorInfo: formData.creatorInfo,
  })
  const feeTx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: new PublicKey(process.env.NEXT_PUBLIC_FEE_WALLET!),
      lamports: feeSOL * 1e9,
    })
  )
  feeTx.feePayer = publicKey
  feeTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

  const signedFeeTx = await signTransaction!(feeTx)
  const feeSig = await connection.sendRawTransaction(signedFeeTx.serialize())
  await connection.confirmTransaction(feeSig)

  // STEP 3: create mint, ATA, mintTo
  onProgress?.(3)
  const mintKeypair = Keypair.generate()
  const rentExempt = await getMinimumBalanceForRentExemptMint(connection)

  // 3a) create & init mint
  const initMintTx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports: rentExempt,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      formData.decimals,
      publicKey,
      publicKey,
      TOKEN_PROGRAM_ID
    )
  )
  initMintTx.feePayer = publicKey
  initMintTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
  initMintTx.partialSign(mintKeypair)

  const signedInitMintTx = await signTransaction!(initMintTx)
  const initMintSig = await connection.sendRawTransaction(
    signedInitMintTx.serialize()
  )
  await connection.confirmTransaction(initMintSig)

  // 3b) ATA
  const ata = await getAssociatedTokenAddress(
    mintKeypair.publicKey,
    publicKey
  )
  const createAtaTx = new Transaction().add(
    createAssociatedTokenAccountInstruction(
      publicKey,
      ata,
      publicKey,
      mintKeypair.publicKey
    )
  )
  createAtaTx.feePayer = publicKey
  createAtaTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

  const signedCreateAtaTx = await signTransaction!(createAtaTx)
  const createAtaSig = await connection.sendRawTransaction(
    signedCreateAtaTx.serialize()
  )
  await connection.confirmTransaction(createAtaSig)

  // 3c) mintTo
  const mintAmount =
    BigInt(formData.supply) * BigInt(10 ** formData.decimals)
  const mintToTx = new Transaction().add(
    createMintToInstruction(
      mintKeypair.publicKey,
      ata,
      publicKey,
      mintAmount
    )
  )
  mintToTx.feePayer = publicKey
  mintToTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

  const signedMintToTx = await signTransaction!(mintToTx)
  const mintToSig = await connection.sendRawTransaction(
    signedMintToTx.serialize()
  )
  await connection.confirmTransaction(mintToSig)

  // STEP 4: on‑chain metadata (V3 manual)
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

  const ix = {
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
        creators: null,
        collection: null,
        uses: null,
        isMutable: !formData.revokeUpdate,
      }),
    ]),
  }

  const metadataTx = new Transaction().add(ix)
  metadataTx.feePayer = publicKey
  metadataTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

  const signedMetadataTx = await signTransaction!(metadataTx)
  const metadataSig = await connection.sendRawTransaction(
    signedMetadataTx.serialize()
  )
  await connection.confirmTransaction(metadataSig)

  // STEP 5: revoke authorities
  onProgress?.(5)
  const revokeIxs = []
  if (formData.revokeMint) {
    revokeIxs.push(
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
    revokeIxs.push(
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

  if (revokeIxs.length) {
    const revokeTx = new Transaction().add(...revokeIxs)
    revokeTx.feePayer = publicKey
    revokeTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

    const signedRevokeTx = await signTransaction!(revokeTx)
    const revokeSig = await connection.sendRawTransaction(
      signedRevokeTx.serialize()
    )
    await connection.confirmTransaction(revokeSig)
  }

  // Done ✅
  const clusterParam =
    process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'devnet'
      ? '?cluster=devnet'
      : ''

  return {
    mintAddress: mintKeypair.publicKey.toString(),
    metadataUrl,
    imageUrl,
    explorerUrl: `https://explorer.solana.com/address/${mintKeypair.publicKey.toString()}${clusterParam}`,
  }
}