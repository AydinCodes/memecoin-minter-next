// src/app/api/transaction/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, clusterApiUrl, TransactionConfirmationStrategy } from '@solana/web3.js';
import { SOLANA_NETWORK } from '@/config';

export async function POST(request: NextRequest) {
  try {
    const { serializedTransaction } = await request.json();
    
    if (!serializedTransaction) {
      return NextResponse.json(
        { error: 'Missing serializedTransaction parameter' },
        { status: 400 }
      );
    }

    // Deserialize the transaction buffer
    const transactionBuffer = Buffer.from(serializedTransaction, 'base64');
    
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
    
    // Send transaction
    const txSignature = await connection.sendRawTransaction(transactionBuffer);
    
    // Get latest blockhash for confirmation
    const latestBlockhash = await connection.getLatestBlockhash('confirmed');
    
    // Confirm transaction
    const confirmationStrategy: TransactionConfirmationStrategy = {
      signature: txSignature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    };
    
    const confirmationResult = await connection.confirmTransaction(confirmationStrategy, 'confirmed');
    
    if (confirmationResult.value.err) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Transaction confirmed but failed',
          details: confirmationResult.value.err
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      signature: txSignature,
      confirmationResult
    });
  } catch (error) {
    console.error('Error processing transaction:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process transaction',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}