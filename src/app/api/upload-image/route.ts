// src/app/api/upload-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import PinataSDK  from '@pinata/sdk';

export async function POST(request: NextRequest) {
  try {
    const pinata = new PinataSDK({ 
      pinataJWTKey: process.env.PINATA_JWT 
    });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer for Pinata
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileObject = {
      content: buffer,
      name: file.name,
    };

    // Upload to Pinata
    const result = await pinata.pinFileToIPFS(fileObject);
    
    return NextResponse.json({ 
      success: true, 
      cid: result.IpfsHash 
    });
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}