// src/services/token-service.ts
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  AuthorityType,
} from "@solana/spl-token";

import { getSolanaConnection, isWalletConnected } from "./wallet-service";
import { FEE_RECIPIENT_WALLET } from "@/config";

// Metaplex Token Metadata Program ID
const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

// Find the metadata PDA for a mint
function findMetadataPda(mint: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  return pda;
}

// Helper function to serialize a string for the Metaplex metadata instruction
function serializeString(value: string): Uint8Array {
  const buffer = Buffer.from(value);
  const length = Buffer.alloc(4);
  length.writeUInt32LE(buffer.length, 0);
  return Buffer.concat([length, buffer]);
}

// Helper function to serialize metadata for the Metaplex createMetadataAccountV3 instruction
function serializeMetadataV3(data: {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators: { address: string; verified: boolean; share: number }[] | null;
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
        const address = new PublicKey(creator.address).toBuffer();
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

// Upload image to Pinata
export async function uploadImageToPinata(imageFile: File) {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Error uploading image: ${response.statusText}`);
    }
    
    const data = await response.json();
    return `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud'}/ipfs/${data.cid}`;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

// Create and upload metadata
export async function createAndUploadMetadata(tokenData: {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  decimals: number;
  supply: number;
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
}) {
  try {
    const metadata = {
      name: tokenData.name,
      symbol: tokenData.symbol,
      description: tokenData.description,
      image: tokenData.imageUrl,
      showName: true,
      website: tokenData.website || "",
      twitter: tokenData.twitter || "",
      telegram: tokenData.telegram || "",
      discord: tokenData.discord || "",
      tokenInfo: {
        chain: "Solana",
        totalSupply: tokenData.supply,
        circulatingSupply: tokenData.supply,
        decimals: tokenData.decimals
      },
      createdOn: "SolMinter"
    };
    
    // Upload metadata to Pinata
    const response = await fetch('/api/upload-metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });
    
    if (!response.ok) {
      throw new Error(`Error uploading metadata: ${response.statusText}`);
    }
    
    const data = await response.json();
    return `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud'}/ipfs/${data.cid}`;
  } catch (error) {
    console.error("Error creating and uploading metadata:", error);
    throw error;
  }
}

// Create metadata for the token
async function createMetadata(
  connection: Connection,
  wallet: any,
  mint: PublicKey,
  metadataUrl: string,
  name: string,
  symbol: string,
  isMutable: boolean
): Promise<string> {
  try {
    // Find the metadata account address (PDA)
    const metadataPDA = findMetadataPda(mint);
    console.log(`Metadata PDA: ${metadataPDA.toString()}`);
    
    // Create metadata account instruction
    const createMetadataIx = {
      programId: TOKEN_METADATA_PROGRAM_ID,
      keys: [
        { pubkey: metadataPDA, isSigner: false, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: false },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
        { pubkey: wallet.publicKey, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.from([
        33, // createMetadataAccountV3 instruction
        ...serializeMetadataV3({
          name,
          symbol,
          uri: metadataUrl,
          sellerFeeBasisPoints: 0,
          creators: null,
          collection: null,
          uses: null,
          isMutable: isMutable,
        }),
      ]),
    };
    
    // Create transaction
    const transaction = new Transaction().add(createMetadataIx);
    
    // Set recent blockhash and fee payer
    transaction.feePayer = wallet.publicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    
    // Sign and send transaction using the wallet adapter
    try {
      // Sign transaction using adapter's signTransaction
      const signedTransaction = await wallet.adapter.signTransaction(transaction);
      
      // Send transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      await connection.confirmTransaction(signature);
      
      console.log(`Metadata transaction signature: ${signature}`);
      return metadataPDA.toString();
    } catch (signError) {
      console.error("Error signing transaction:", signError);
      
      // Alternative method using sendTransaction
      if (wallet.adapter.sendTransaction) {
        const signature = await wallet.adapter.sendTransaction(transaction, connection);
        await connection.confirmTransaction(signature);
        
        console.log(`Metadata transaction signature (alternative method): ${signature}`);
        return metadataPDA.toString();
      } else {
        throw signError;
      }
    }
  } catch (error) {
    console.error("Error creating metadata:", error);
    throw error;
  }
}

// Helper function for sending transactions with the wallet adapter
async function sendTransaction(
  connection: Connection,
  wallet: any,
  transaction: Transaction,
  signers: Keypair[] = []
) {
  // Add recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;
  
  // If there are additional signers, sign with them first
  if (signers.length > 0) {
    transaction.partialSign(...signers);
  }
  
  try {
    // Try using signTransaction + sendRawTransaction
    const signedTransaction = await wallet.adapter.signTransaction(transaction);
    const rawTransaction = signedTransaction.serialize();
    const signature = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });
    
    await connection.confirmTransaction(signature);
    return signature;
  } catch (signError) {
    console.error("Error signing transaction:", signError);
    
    // Try using the sendTransaction method as fallback
    if (wallet.adapter.sendTransaction) {
      try {
        const signature = await wallet.adapter.sendTransaction(transaction, connection);
        await connection.confirmTransaction(signature);
        return signature;
      } catch (sendError) {
        console.error("Error using sendTransaction:", sendError);
        throw sendError;
      }
    } else {
      throw signError;
    }
  }
}

// Calculate fee in SOL based on selected options
export function calculateFee(options: {
  revokeMint: boolean;
  revokeFreeze: boolean;
  revokeUpdate: boolean;
  socialLinks: boolean;
  creatorInfo: boolean;
}): number {
  let fee = 0.2; // Base fee
  
  if (options.revokeMint) fee += 0.1;
  if (options.revokeFreeze) fee += 0.1;
  if (options.revokeUpdate) fee += 0.1;
  if (options.socialLinks) fee += 0.1;
  if (options.creatorInfo) fee += 0.1;
  
  return Math.min(fee, 0.3); // Capped at 0.3 SOL as per the UI
}

// Transfer fee to recipient
async function transferFee(
  connection: Connection,
  wallet: any,
  feeInSol: number
) {
  try {
    // Create fee recipient wallet PublicKey
    const feeRecipient = new PublicKey(FEE_RECIPIENT_WALLET);
    
    // Log info for debugging
    console.log("Transferring fee...");
    console.log("Wallet public key:", wallet.publicKey?.toString());
    console.log("Fee recipient:", feeRecipient.toString());
    console.log("Fee in SOL:", feeInSol);
    
    // Create a transaction to transfer SOL
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: feeRecipient,
        lamports: feeInSol * 1000000000, // Convert SOL to lamports
      })
    );
    
    // Set recent blockhash and fee payer
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign and send transaction using the wallet adapter
    const signature = await wallet.adapter.sendTransaction(transaction, connection);
    
    // Wait for confirmation
    await connection.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature
    });
    
    console.log(`Fee transfer successful: ${signature}`);
    return signature;
  } catch (error) {
    console.error("Error transferring fee:", error);
    throw error;
  }
}

// Create token with metadata - completely refactored to avoid type errors
async function createToken(
  wallet: any,
  tokenData: {
    name: string;
    symbol: string;
    decimals: number;
    supply: number;
    description: string;
    metadataUrl: string;
    revokeMint: boolean;
    revokeFreeze: boolean;
    revokeUpdate: boolean;
  }
): Promise<string> {
  try {
    // Set up connection
    const connection = getSolanaConnection();
    
    // Check wallet connection again
    if (!isWalletConnected(wallet)) {
      throw new Error("Wallet not connected");
    }
    
    // Generate a keypair for the mint
    const mintKeypair = Keypair.generate();
    console.log(`Creating token mint for ${tokenData.name}...`);
    
    // Get minimum balance for rent exemption
    const lamportsForMint = await getMinimumBalanceForRentExemptMint(connection);
    
    // Create transaction for creating the mint account
    const createAccountTransaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports: lamportsForMint,
        programId: TOKEN_PROGRAM_ID
      }),
      // Initialize the mint
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        tokenData.decimals,
        wallet.publicKey,
        wallet.publicKey,
        TOKEN_PROGRAM_ID
      )
    );
    
    // Send transaction to create and initialize mint
    await sendTransaction(connection, wallet, createAccountTransaction, [mintKeypair]);
    console.log(`Mint account created: ${mintKeypair.publicKey.toString()}`);
    
    // Create a token account for the wallet
    console.log("Creating token account...");
    const associatedTokenAddress = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      wallet.publicKey
    );
    
    // Check if the token account already exists
    const tokenAccountInfo = await connection.getAccountInfo(associatedTokenAddress);
    
    if (!tokenAccountInfo) {
      // Create the associated token account
      const createTokenAccountTx = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey, // payer
          associatedTokenAddress, // associatedToken
          wallet.publicKey, // owner
          mintKeypair.publicKey // mint
        )
      );
      
      await sendTransaction(connection, wallet, createTokenAccountTx);
      console.log(`Token account created: ${associatedTokenAddress.toString()}`);
    }
    
    // Mint initial supply to the wallet
    console.log(`Minting ${tokenData.supply} tokens to your wallet...`);
    const initialSupply = tokenData.supply * Math.pow(10, tokenData.decimals);
    
    const mintToTransaction = new Transaction().add(
      createMintToInstruction(
        mintKeypair.publicKey, // mint
        associatedTokenAddress, // destination
        wallet.publicKey, // authority
        BigInt(initialSupply) // amount
      )
    );
    
    await sendTransaction(connection, wallet, mintToTransaction);
    console.log("Initial token supply minted successfully");
    
    // Add metadata to the token
    console.log("Adding token metadata...");
    const metadataPDA = await createMetadata(
      connection,
      wallet,
      mintKeypair.publicKey,
      tokenData.metadataUrl,
      tokenData.name,
      tokenData.symbol,
      !tokenData.revokeUpdate
    );
    console.log("Metadata added successfully");
    
    // Revoke authorities if configured to do so
    if (tokenData.revokeMint || tokenData.revokeFreeze) {
      console.log("Revoking authorities...");
      
      let revokeTransaction = new Transaction();
      
      if (tokenData.revokeMint) {
        console.log("Revoking mint authority (supply will be fixed)...");
        
        // Create a setAuthority instruction for MintTokens
        const revokeMintInstruction = await import('@solana/spl-token').then(token => {
          return token.createSetAuthorityInstruction(
            mintKeypair.publicKey, // mint
            wallet.publicKey, // currentAuthority
            AuthorityType.MintTokens, // authorityType
            null // newAuthority - null means revoke
          );
        });
        
        revokeTransaction.add(revokeMintInstruction);
      }
      
      if (tokenData.revokeFreeze) {
        console.log("Revoking freeze authority...");
        
        // Create a setAuthority instruction for FreezeAccount
        const revokeFreezeInstruction = await import('@solana/spl-token').then(token => {
          return token.createSetAuthorityInstruction(
            mintKeypair.publicKey, // mint
            wallet.publicKey, // currentAuthority
            AuthorityType.FreezeAccount, // authorityType
            null // newAuthority - null means revoke
          );
        });
        
        revokeTransaction.add(revokeFreezeInstruction);
      }
      
      if (revokeTransaction.instructions.length > 0) {
        await sendTransaction(connection, wallet, revokeTransaction);
        console.log("Authorities revoked successfully");
      }
    }
    
    // Return the mint address
    return mintKeypair.publicKey.toString();
  } catch (error) {
    console.error("Error creating token:", error);
    throw error;
  }
}

// Main function that handles the entire token creation process
export async function createTokenWithMetadata(
  wallet: any,
  formData: {
    name: string;
    symbol: string;
    decimals: number;
    supply: number;
    description: string;
    logo: File | null;
    revokeMint: boolean;
    revokeFreeze: boolean;
    revokeUpdate: boolean;
    socialLinks: boolean;
    creatorInfo: boolean;
    website?: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
  }
) {
  try {
     // Validate wallet connection - simpler check
     if (!wallet || !wallet.publicKey) {
      throw new Error("Wallet not connected. Please connect your wallet and try again.");
    }
    
    console.log("Starting token creation process...");
    console.log("Connected wallet:", wallet.publicKey.toString());
    
    // Calculate fee
    const feeInSol = calculateFee({
      revokeMint: formData.revokeMint,
      revokeFreeze: formData.revokeFreeze,
      revokeUpdate: formData.revokeUpdate,
      socialLinks: formData.socialLinks,
      creatorInfo: formData.creatorInfo
    });
    
    // Set up connection
    const connection = getSolanaConnection();
    
    // Check wallet balance before proceeding
    const balance = await connection.getBalance(wallet.publicKey);
    const balanceInSol = balance / 1000000000; // Convert lamports to SOL
    console.log(`Wallet balance: ${balanceInSol} SOL`);
    
    if (balanceInSol < feeInSol) {
      throw new Error(`Insufficient balance. You have ${balanceInSol.toFixed(4)} SOL but need at least ${feeInSol} SOL.`);
    }
    
    // 1. First upload image (before any transactions to avoid wasting gas if upload fails)
    if (!formData.logo) {
      throw new Error("Logo image is required");
    }
    
    console.log("Uploading image...");
    const imageUrl = await uploadImageToPinata(formData.logo);
    console.log("Image uploaded:", imageUrl);
    
    // 2. Create and upload metadata
    console.log("Creating and uploading metadata...");
    const metadataUrl = await createAndUploadMetadata({
      name: formData.name,
      symbol: formData.symbol,
      description: formData.description,
      imageUrl,
      decimals: formData.decimals,
      supply: formData.supply,
      website: formData.website,
      twitter: formData.twitter,
      telegram: formData.telegram,
      discord: formData.discord
    });
    console.log("Metadata uploaded:", metadataUrl);
    
    // 3. Transfer fee
    console.log(`Transferring fee of ${feeInSol} SOL...`);
    await transferFee(connection, wallet, feeInSol);
    console.log("Fee transferred successfully");
    
    // 4. Create token with metadata
    console.log("Creating token...");
    const mintAddress = await createToken(wallet, {
      name: formData.name,
      symbol: formData.symbol,
      decimals: formData.decimals,
      supply: formData.supply,
      description: formData.description,
      metadataUrl,
      revokeMint: formData.revokeMint,
      revokeFreeze: formData.revokeFreeze,
      revokeUpdate: formData.revokeUpdate
    });
    console.log("Token created successfully with address:", mintAddress);
    
    const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
    return {
      success: true,
      mintAddress,
      metadataUrl,
      imageUrl,
      explorerUrl: `https://explorer.solana.com/address/${mintAddress}${network === 'devnet' ? '?cluster=devnet' : ''}`
    };
  } catch (error) {
    console.error("Error in token creation process:", error);
    throw error;
  }
}