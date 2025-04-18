// src/app/api/upload-metadata/route.ts
import { NextRequest, NextResponse } from 'next/server';
import PinataSDK from '@pinata/sdk';

export async function POST(request: NextRequest) {
  try {
    const pinata = new PinataSDK({ 
      pinataJWTKey: process.env.PINATA_JWT 
    });

    const metadata = await request.json();
    
    // Upload JSON metadata to Pinata
    const result = await pinata.pinJSONToIPFS(metadata);
    
    return NextResponse.json({ 
      success: true, 
      cid: result.IpfsHash 
    });
  } catch (error) {
    console.error('Error uploading metadata to Pinata:', error);
    return NextResponse.json(
      { error: 'Failed to upload metadata' },
      { status: 500 }
    );
  }
}