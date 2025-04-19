// src/services/token-service.ts
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  clusterApiUrl,
  SendOptions,
} from "@solana/web3.js";

import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  setAuthority,
  AuthorityType,
} from "@solana/spl-token";

// Metaplex Token Metadata Program ID
const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

// Recipient wallet for fee collection
const FEE_RECIPIENT = new PublicKey(process.env.NEXT_PUBLIC_FEE_WALLET || "8oUmkz9VmF9upLxUg6qp6iaq5N4A86bUuo37SJvXvzWt");

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
    
    // Sign transaction using adapter's signTransaction
    const signedTransaction = await wallet.adapter.signTransaction(transaction);
    
    // Send transaction
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    await connection.confirmTransaction(signature);
    
    console.log(`Metadata transaction signature: ${signature}`);
    return metadataPDA.toString();
  } catch (error) {
    console.error("Error creating metadata:", error);
    throw error;
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
    return `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${data.cid}`;
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
    return `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${data.cid}`;
  } catch (error) {
    console.error("Error creating and uploading metadata:", error);
    throw error;
  }
}

// Transfer fee to recipient
async function transferFee(
  connection: Connection,
  wallet: any,
  feeInSol: number
) {
  try {
    // Log info for debugging
    console.log("Transferring fee...");
    console.log("Wallet public key:", wallet.publicKey?.toString());
    console.log("Fee recipient:", FEE_RECIPIENT.toString());
    console.log("Fee in SOL:", feeInSol);
    
    // Create a transaction to transfer SOL
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: FEE_RECIPIENT,
        lamports: feeInSol * 1000000000, // Convert SOL to lamports
      })
    );
    
    // Set recent blockhash and fee payer
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;
    
    try {
      // Request signing from the wallet
      console.log("Requesting wallet to sign transaction...");
      const signed = await wallet.signTransaction(transaction);
      
      // Send the transaction
      console.log("Sending signed transaction...");
      const signature = await connection.sendRawTransaction(signed.serialize());
      
      // Wait for confirmation
      console.log("Waiting for transaction confirmation...");
      await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature
      });
      
      console.log(`Fee transfer successful: ${signature}`);
      return signature;
    } catch (signError) {
      console.error("Error during signing:", signError);
      // Try alternative approach with sendTransaction if signTransaction fails
      if (wallet.sendTransaction) {
        console.log("Trying alternative approach with sendTransaction...");
        const signature = await wallet.sendTransaction(transaction, connection);
        
        // Wait for confirmation
        await connection.confirmTransaction({
          blockhash,
          lastValidBlockHeight,
          signature
        });
        
        console.log(`Fee transfer successful (alternative method): ${signature}`);
        return signature;
      } else {
        throw signError;
      }
    }
  } catch (error) {
    console.error("Error transferring fee:", error);
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
  
  // Sign with the wallet adapter
  const signedTransaction = await wallet.adapter.signTransaction(transaction);
  
  // Send and confirm transaction
  const rawTransaction = signedTransaction.serialize();
  const signature = await connection.sendRawTransaction(rawTransaction, {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  } as SendOptions);
  
  await connection.confirmTransaction(signature);
  return signature;
}

// Main function to create token - refactored to use the wallet adapter properly
export async function createToken(
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
    const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";
    console.log(`Connecting to Solana ${network}...`);
    const connection = new Connection(
      clusterApiUrl(network as "devnet" | "mainnet-beta"), 
      "confirmed"
    );
    
    // Check wallet connection
    if (!wallet.publicKey) {
      throw new Error("Wallet not connected");
    }
    
    // Generate a keypair for the mint
    const mintKeypair = Keypair.generate();
    console.log(`Creating token mint for ${tokenData.name}...`);
    
    // Create the token mint - we need to adjust how we use the wallet adapter
    const lamportsForMint = await connection.getMinimumBalanceForRentExemption(82);
    
    // Use a separate function to handle all the transaction logic
    const createMintTransaction = new Transaction().add(
      // Create account for the mint
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: 82,
        lamports: lamportsForMint,
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") // Token Program ID
      })
    );
    
    // Send the transaction to create mint account
    await sendTransaction(connection, wallet, createMintTransaction, [mintKeypair]);
    
    // Initialize the mint
    const initMintTransaction = await createMint(
      connection, 
      {
        publicKey: wallet.publicKey,
        signTransaction: async (tx: Transaction) => wallet.adapter.signTransaction(tx),
      } as any,
      wallet.publicKey,
      wallet.publicKey,
      tokenData.decimals,
      mintKeypair
    );
    
    // Create a token account for the wallet
    console.log("Creating token account...");
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: async (tx: Transaction) => wallet.adapter.signTransaction(tx),
      } as any,
      mintKeypair.publicKey,
      wallet.publicKey
    );
    
    // Mint initial supply
    console.log(`Minting ${tokenData.supply} tokens to your wallet...`);
    const initialSupply = tokenData.supply * Math.pow(10, tokenData.decimals);
    
    const mintToTransaction = await mintTo(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: async (tx: Transaction) => wallet.adapter.signTransaction(tx),
      } as any,
      mintKeypair.publicKey,
      tokenAccount.address,
      wallet.publicKey,
      initialSupply
    );
    
    // Add metadata
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
    
    // Revoke authorities if configured to do so
    if (tokenData.revokeMint) {
      console.log("Revoking mint authority (supply will be fixed)...");
      await setAuthority(
        connection,
        {
          publicKey: wallet.publicKey,
          signTransaction: async (tx: Transaction) => wallet.adapter.signTransaction(tx),
        } as any,
        mintKeypair.publicKey,
        wallet.publicKey,
        AuthorityType.MintTokens,
        null
      );
    }
    
    if (tokenData.revokeFreeze) {
      console.log("Revoking freeze authority...");
      await setAuthority(
        connection,
        {
          publicKey: wallet.publicKey,
          signTransaction: async (tx: Transaction) => wallet.adapter.signTransaction(tx),
        } as any,
        mintKeypair.publicKey,
        wallet.publicKey,
        AuthorityType.FreezeAccount,
        null
      );
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
    // Validate wallet connection
    if (!wallet || !wallet.publicKey) {
      throw new Error("Wallet not connected. Please connect your wallet and try again.");
    }
    
    console.log("Starting token creation process...");
    console.log("Connected wallet:", wallet.publicKey.toString());
    
    // Calculate fee - implement the calculation directly to ensure it matches UI
    let feeInSol = 0.2; // Base fee
    if (formData.revokeMint) feeInSol += 0.1;
    if (formData.revokeFreeze) feeInSol += 0.1;
    if (formData.revokeUpdate) feeInSol += 0.1;
    if (formData.socialLinks) feeInSol += 0.1;
    if (formData.creatorInfo) feeInSol += 0.1;
    feeInSol = Math.min(feeInSol, 0.3); // Apply discount cap
    
    // Set up connection
    const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";
    const connection = new Connection(
      clusterApiUrl(network as "devnet" | "mainnet-beta"), 
      "confirmed"
    );
    
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