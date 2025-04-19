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

export interface FormDataType {
  name: string
  symbol: string
  decimals: number
  supply: number
  description: string
  logo: File
  revokeMint: boolean
  revokeFreeze: boolean
  revokeUpdate: boolean
  socialLinks: boolean
  creatorInfo: boolean
  website?: string
  twitter?: string
  telegram?: string
  discord?: string
}

export interface TokenResult {
  mintAddress: string
  metadataUrl: string
  imageUrl: string
  explorerUrl: string
}

/**
 * Creates a token and calls onProgress(stepIndex) at each major stage.
 * Steps:
 * 0: Upload image
 * 1: Upload metadata
 * 2: Process payment
 * 3: Create mint + ATA + mintTo
 * 4: Revoke authorities
 */
export async function createTokenWithMetadata(
  walletAdapter: WalletContextState,
  formData: FormDataType,
  onProgress?: (step: number) => void
): Promise<TokenResult> {
  const { publicKey, signTransaction, connected } = walletAdapter
  if (!connected || !publicKey) {
    throw new Error(
      'Wallet not connected. Please connect your wallet and try again.'
    )
  }
  const connection: Connection = getSolanaConnection()

  // --- Step 0: Upload image ---
  onProgress?.(0)
  const imageUrl = await uploadImageToIPFS(formData.logo)

  // --- Step 1: Upload metadata ---
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

  // --- Step 2: Transfer fee ---
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

  // --- Step 3: Create mint, ATA, mintTo ---
  onProgress?.(3)

  // 3a: create mint account
  const mintKeypair = Keypair.generate()
  const rentExemption = await getMinimumBalanceForRentExemptMint(connection)

  const createMintTx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports: rentExemption,
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
  createMintTx.feePayer = publicKey
  createMintTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
  createMintTx.partialSign(mintKeypair)

  const signedCreateMintTx = await signTransaction!(createMintTx)
  const createMintSig = await connection.sendRawTransaction(
    signedCreateMintTx.serialize()
  )
  await connection.confirmTransaction(createMintSig)

  // 3b: create ATA
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

  // 3c: mintTo
  const amount = BigInt(formData.supply) * BigInt(10 ** formData.decimals)
  const mintToTx = new Transaction().add(
    createMintToInstruction(
      mintKeypair.publicKey,
      ata,
      publicKey,
      amount
    )
  )
  mintToTx.feePayer = publicKey
  mintToTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

  const signedMintToTx = await signTransaction!(mintToTx)
  const mintToSig = await connection.sendRawTransaction(
    signedMintToTx.serialize()
  )
  await connection.confirmTransaction(mintToSig)

  // --- Step 4: Revoke authorities ---
  onProgress?.(4)
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

  // Done!
  const clusterParam =
    process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'devnet' ? '?cluster=devnet' : ''
  return {
    mintAddress: mintKeypair.publicKey.toString(),
    metadataUrl,
    imageUrl,
    explorerUrl: `https://explorer.solana.com/address/${mintKeypair.publicKey.toString()}${clusterParam}`,
  }
}
