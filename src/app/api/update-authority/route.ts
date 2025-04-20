// src/app/api/update-authority/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bs58 from 'bs58';
import { Keypair } from '@solana/web3.js';

/**
 * API route that securely provides the public key of the update authority
 * This keeps the private key on the server side
 */
export async function GET(request: NextRequest) {
  try {
    // Get the private key from environment variables
    const updateAuthorityPrivateKey = process.env.REVOKE_UPDATE_PRIVATE_KEY;
    
    if (!updateAuthorityPrivateKey) {
      console.error("REVOKE_UPDATE_PRIVATE_KEY is not set in environment variables");
      return NextResponse.json(
        { 
          success: false, 
          error: "Update authority not configured",
          message: "Server environment is not properly configured for update authority revocation."
        },
        { status: 500 }
      );
    }
    
    try {
      // Decode the base58-encoded private key to generate keypair
      const secretKey = bs58.decode(updateAuthorityPrivateKey);
      const updateAuthorityKeypair = Keypair.fromSecretKey(secretKey);
      
      // Return only the public key
      return NextResponse.json({
        success: true,
        updateAuthorityPublicKey: updateAuthorityKeypair.publicKey.toString()
      });
    } catch (error) {
      console.error("Error creating update authority keypair:", error);
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid update authority key format",
          message: "Server has an invalid private key format."
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error accessing update authority:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Server error", 
        message: "An unexpected error occurred while accessing the update authority."
      },
      { status: 500 }
    );
  }
}