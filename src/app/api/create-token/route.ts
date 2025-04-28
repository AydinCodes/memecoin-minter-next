// src/app/api/create-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bs58 from 'bs58';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { SOLANA_NETWORK } from '@/config';

// Use server-side only RPC endpoints
function getServerSideRpcUrl() {
  const network = SOLANA_NETWORK === 'mainnet-beta' ? 'mainnet-beta' : 'devnet';
  
  if (network === 'mainnet-beta' && process.env.SOLANA_MAINNET_RPC) {
    return process.env.SOLANA_MAINNET_RPC;
  } else if (network === 'devnet' && process.env.SOLANA_DEVNET_RPC) {
    return process.env.SOLANA_DEVNET_RPC;
  } else {
    // This will be used as fallback if no server-side endpoints are configured
    return null;
  }
}

// This API endpoint is for validating the environment is correctly set up
// We don't actually create tokens here - that happens client-side
// But we confirm the update authority keypair is valid
export async function GET(request: NextRequest) {
  try {
    // Check if the required environment variable is present
    const updatePrivateKey = process.env.REVOKE_UPDATE_PRIVATE_KEY;
    
    if (!updatePrivateKey) {
      return NextResponse.json(
        { 
          ok: false, 
          error: "Update authority private key is not configured",
          message: "The server is not properly configured for revoking update authority. Please check server configuration."
        },
        { status: 500 }
      );
    }
    
    // Try to create a keypair from the private key
    try {
      const secretKey = bs58.decode(updatePrivateKey);
      const updateAuthorityKeypair = Keypair.fromSecretKey(secretKey);
      const updateAuthorityPublicKey = updateAuthorityKeypair.publicKey.toString();
      
      // Return a redacted version of the public key for confirmation
      const redactedPublicKey = `${updateAuthorityPublicKey.substring(0, 4)}...${updateAuthorityPublicKey.substring(updateAuthorityPublicKey.length - 4)}`;
      
      // Check if we have server-side RPC endpoints configured
      const serverSideRpcUrl = getServerSideRpcUrl();
      
      return NextResponse.json({ 
        ok: true, 
        message: "Update authority configuration is valid", 
        updateAuthority: redactedPublicKey,
        network: SOLANA_NETWORK,
        rpcConfigured: !!serverSideRpcUrl
      });
    } catch (error) {
      console.error("Error validating update authority keypair:", error);
      return NextResponse.json(
        { 
          ok: false, 
          error: "Invalid update authority key format",
          message: "The server has an incorrectly formatted update authority key."
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in update authority validation:", error);
    return NextResponse.json(
      { 
        ok: false, 
        error: "Server error", 
        message: "An unexpected error occurred while validating the server configuration."
      },
      { status: 500 }
    );
  }
}