// src/app/api/solana-rpc/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { clusterApiUrl } from '@solana/web3.js';
import { SOLANA_NETWORK } from '@/config';

export async function GET(request: NextRequest) {
  try {
    const network = SOLANA_NETWORK === 'mainnet-beta' ? 'mainnet-beta' : 'devnet';
    
    // Get RPC URL based on network
    let rpcUrl: string;
    
    if (network === 'mainnet-beta') {
      rpcUrl = process.env.SOLANA_MAINNET_RPC || clusterApiUrl('mainnet-beta');
    } else {
      rpcUrl = process.env.SOLANA_DEVNET_RPC || clusterApiUrl('devnet');
    }
    
    // Log only for debugging - don't include actual URLs in production logs
    console.log(`Using ${network} RPC endpoint`);
    
    return NextResponse.json({ 
      success: true, 
      network,
      // Do NOT return the actual URL for security
      endpointConfigured: network === 'mainnet-beta' 
        ? !!process.env.SOLANA_MAINNET_RPC 
        : !!process.env.SOLANA_DEVNET_RPC
    });
  } catch (error) {
    console.error('Error in solana-rpc endpoint:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get RPC configuration',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}