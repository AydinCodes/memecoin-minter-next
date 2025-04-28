// src/app/api/blockhash/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { SOLANA_NETWORK } from '@/config';

export async function GET(request: NextRequest) {
  try {
    // Determine network and RPC URL
    const network = SOLANA_NETWORK === 'mainnet-beta' ? 'mainnet-beta' : 'devnet';
    let rpcUrl: string;
    
    if (network === 'mainnet-beta') {
      rpcUrl = process.env.SOLANA_MAINNET_RPC || clusterApiUrl('mainnet-beta');
    } else {
      rpcUrl = process.env.SOLANA_DEVNET_RPC || clusterApiUrl('devnet');
    }
    
    // Create connection
    const connection = new Connection(rpcUrl, 'confirmed');
    
    // Get latest blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
    
    return NextResponse.json({ 
      success: true, 
      blockhash,
      lastValidBlockHeight
    });
  } catch (error) {
    console.error('Error getting blockhash:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get blockhash',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}