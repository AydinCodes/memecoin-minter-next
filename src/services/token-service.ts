// ===== File: src/services/token-service.ts =====

import { Connection, PublicKey, Transaction, SystemProgram, Keypair } from '@solana/web3.js'
import {
  MINT_SIZE,
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  AuthorityType,
  createSetAuthorityInstruction,
} from '@solana/spl-token'

import { getSolanaConnection } from './wallet-service'
import {
  uploadImageToIPFS,
  uploadMetadataToIPFS,
  MetadataPayload,
} from './ipfs-service'
import { calculateFee, FeeOptions } from './fee-service'
import type { WalletContextState } from '@solana/wallet-adapter-react'

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

export async function createTokenWithMetadata(
  walletAdapter: WalletContextState,
  formData: FormDataType
): Promise<TokenResult> {
  const { publicKey, signTransaction, sendTransaction, connected } = walletAdapter
  if (!connected || !publicKey || !signTransaction) {
    throw new Error('Wallet not connected. Please connect your wallet and try again.')
  }

  const connection: Connection = getSolanaConnection()

  // 1. Upload image to IPFS
  const imageUrl = await uploadImageToIPFS(formData.logo)

  // 2. Upload metadata to IPFS
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

  // 3. Transfer creation fee
  const feeSOL = calculateFee({
    revokeMint: formData.revokeMint,
    revokeFreeze: formData.revokeFreeze,
    revokeUpdate: formData.revokeUpdate,
    socialLinks: formData.socialLinks,
    creatorInfo: formData.creatorInfo,
  } as FeeOptions)

  const feeTx = new Transaction()
    .add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(process.env.NEXT_PUBLIC_FEE_WALLET!),
        lamports: feeSOL * 1e9,
      })
    )
  feeTx.feePayer = publicKey
  const { blockhash: feeBlockhash } = await connection.getLatestBlockhash()
  feeTx.recentBlockhash = feeBlockhash

  // Sign and send fee transaction
  {
    const signedFeeTx = await signTransaction(feeTx)
    const feeSig = await connection.sendRawTransaction(signedFeeTx.serialize())
    await connection.confirmTransaction(feeSig)
  }

  // 4. Create mint
  const mintKeypair = Keypair.generate()
  const lamportsForMint = await getMinimumBalanceForRentExemptMint(connection)
  const createMintTx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports: lamportsForMint,
      programId: new PublicKey(process.env.NEXT_PUBLIC_TOKEN_PROGRAM_ID!),
    }),
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      formData.decimals,
      publicKey,
      publicKey,
      new PublicKey(process.env.NEXT_PUBLIC_TOKEN_PROGRAM_ID!)
    )
  )
  createMintTx.feePayer = publicKey
  const { blockhash: mintBlockhash } = await connection.getLatestBlockhash()
  createMintTx.recentBlockhash = mintBlockhash

  // Partially sign with the new mint keypair
  createMintTx.partialSign(mintKeypair)
  const signedCreateMintTx = await signTransaction(createMintTx)
  const mintSig = await connection.sendRawTransaction(signedCreateMintTx.serialize())
  await connection.confirmTransaction(mintSig)

  // 5. Create associated token account
  const ataAddress = await getAssociatedTokenAddress(
    mintKeypair.publicKey,
    publicKey
  )
  const ataTx = new Transaction().add(
    createAssociatedTokenAccountInstruction(
      publicKey,
      ataAddress,
      publicKey,
      mintKeypair.publicKey
    )
  )
  ataTx.feePayer = publicKey
  const { blockhash: ataBlockhash } = await connection.getLatestBlockhash()
  ataTx.recentBlockhash = ataBlockhash

  const signedAtaTx = await signTransaction(ataTx)
  const ataSig = await connection.sendRawTransaction(signedAtaTx.serialize())
  await connection.confirmTransaction(ataSig)

  // 6. Mint initial supply
  const mintToTx = new Transaction().add(
    createMintToInstruction(
      mintKeypair.publicKey,
      ataAddress,
      publicKey,
      BigInt(formData.supply) * BigInt(10 ** formData.decimals)
    )
  )
  mintToTx.feePayer = publicKey
  const { blockhash: mintToBlockhash } = await connection.getLatestBlockhash()
  mintToTx.recentBlockhash = mintToBlockhash

  const signedMintToTx = await signTransaction(mintToTx)
  const mintToSig = await connection.sendRawTransaction(signedMintToTx.serialize())
  await connection.confirmTransaction(mintToSig)

  // 7. TODO: add on-chain metadata via Metaplex

  // 8. Revoke authorities if requested
  const revokeTx = new Transaction()
  if (formData.revokeMint) {
    revokeTx.add(
      createSetAuthorityInstruction(
        mintKeypair.publicKey,
        publicKey,
        AuthorityType.MintTokens,
        null
      )
    )
  }
  if (formData.revokeFreeze) {
    revokeTx.add(
      createSetAuthorityInstruction(
        mintKeypair.publicKey,
        publicKey,
        AuthorityType.FreezeAccount,
        null
      )
    )
  }

  if (revokeTx.instructions.length > 0) {
    revokeTx.feePayer = publicKey
    const { blockhash: revokeBlockhash } = await connection.getLatestBlockhash()
    revokeTx.recentBlockhash = revokeBlockhash

    const signedRevokeTx = await signTransaction(revokeTx)
    const revokeSig = await connection.sendRawTransaction(signedRevokeTx.serialize())
    await connection.confirmTransaction(revokeSig)
  }

  // 9. Return result
  const cluster =
    process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'devnet' ? '?cluster=devnet' : ''
  return {
    mintAddress: mintKeypair.publicKey.toString(),
    metadataUrl,
    imageUrl,
    explorerUrl: `https://explorer.solana.com/address/${mintKeypair.publicKey.toString()}${cluster}`,
  }
}
