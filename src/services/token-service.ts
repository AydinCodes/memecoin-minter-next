// src/services/token-service.ts
import {
    Connection,
    Keypair,
    PublicKey,
    Transaction,
    sendAndConfirmTransaction,
    SystemProgram,
    clusterApiUrl,
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
      
      // Sign with wallet adapter
      const signedTransaction = await wallet.signTransaction(transaction);
      
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
      // Create a transaction to transfer SOL
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: FEE_RECIPIENT,
          lamports: feeInSol * 1000000000, // Convert SOL to lamports
        })
      );
      
      // Set recent blockhash and fee payer
      transaction.feePayer = wallet.publicKey;
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      
      // Sign and send transaction
      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      await connection.confirmTransaction(signature);
      
      console.log(`Fee transfer successful: ${signature}`);
      return signature;
    } catch (error) {
      console.error("Error transferring fee:", error);
      throw error;
    }
  }
  
  // Main function to create token
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
      
      // Create the token mint
      console.log(`Creating token mint for ${tokenData.name}...`);
      const mint = await createMint(
        connection,
        {
          publicKey: wallet.publicKey,
          signTransaction: wallet.signTransaction,
          signAllTransactions: wallet.signAllTransactions,
        } as any,
        wallet.publicKey, // Mint authority
        wallet.publicKey, // Freeze authority
        tokenData.decimals
      );
      
      console.log(`Token mint created with address: ${mint.toString()}`);
      
      // Create a token account for the payer
      console.log("Creating token account...");
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        {
          publicKey: wallet.publicKey,
          signTransaction: wallet.signTransaction,
          signAllTransactions: wallet.signAllTransactions,
        } as any,
        mint,
        wallet.publicKey
      );
      
      // Mint initial supply to the payer
      console.log(`Minting ${tokenData.supply} tokens to your wallet...`);
      const initialSupply = tokenData.supply * Math.pow(10, tokenData.decimals);
      
      await mintTo(
        connection,
        {
          publicKey: wallet.publicKey,
          signTransaction: wallet.signTransaction,
          signAllTransactions: wallet.signAllTransactions,
        } as any,
        mint,
        tokenAccount.address,
        wallet.publicKey,
        initialSupply
      );
      
      // Add metadata to the token
      console.log("Adding token metadata...");
      const metadataPDA = await createMetadata(
        connection,
        wallet,
        mint,
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
            signTransaction: wallet.signTransaction,
            signAllTransactions: wallet.signAllTransactions,
          } as any,
          mint,
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
            signTransaction: wallet.signTransaction,
            signAllTransactions: wallet.signAllTransactions,
          } as any,
          mint,
          wallet.publicKey,
          AuthorityType.FreezeAccount,
          null
        );
      }
      
      // Return the mint address
      return mint.toString();
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
      // Calculate fee
      const feeInSol = calculateFee({
        revokeMint: formData.revokeMint,
        revokeFreeze: formData.revokeFreeze,
        revokeUpdate: formData.revokeUpdate,
        socialLinks: formData.socialLinks,
        creatorInfo: formData.creatorInfo
      });
      
      // Set up connection
      const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";
      const connection = new Connection(
        clusterApiUrl(network as "devnet" | "mainnet-beta"), 
        "confirmed"
      );
      
      // 1. Transfer fee
      console.log(`Transferring fee of ${feeInSol} SOL...`);
      await transferFee(connection, wallet, feeInSol);
      
      // 2. Upload image
      if (!formData.logo) {
        throw new Error("Logo image is required");
      }
      
      console.log("Uploading image...");
      const imageUrl = await uploadImageToPinata(formData.logo);
      
      // 3. Create and upload metadata
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