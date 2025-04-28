// src/app/api/wallet-balance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { SOLANA_NETWORK } from '@/config';

export async function GET(request: NextRequest) {
  try {
    // Get wallet address from query params
    const url = new URL(request.url);
    const publicKeyStr = url.searchParams.get('publicKey');
    
    if (!publicKeyStr) {
      return NextResponse.json(
        { error: 'Missing publicKey parameter' },
        { status: 400 }
      );
    }

    // Validate the public key format
    let publicKey: PublicKey;
    try {
      publicKey = new PublicKey(publicKeyStr);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid publicKey format' },
        { status: 400 }
      );
    }

    // Determine network and RPC URL
    const network = SOLANA_NETWORK === 'mainnet-beta' ? 'mainnet-beta' : 'devnet';
    let rpcUrl: string;
    
    if (network === 'mainnet-beta') {
      rpcUrl = process.env.SOLANA_MAINNET_RPC || clusterApiUrl('mainnet-beta');
    } else {
      rpcUrl = process.env.SOLANA_DEVNET_RPC || clusterApiUrl('devnet');
    }
    
    // Create connection and get balance
    const connection = new Connection(rpcUrl, 'confirmed');
    const balance = await connection.getBalance(publicKey);
    const solBalance = balance / 1_000_000_000; // Convert lamports to SOL
    
    return NextResponse.json({ 
      success: true, 
      balance: solBalance,
      network
    });
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get wallet balance',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}