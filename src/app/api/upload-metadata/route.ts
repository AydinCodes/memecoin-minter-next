// src/app/api/upload-metadata/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the metadata from the request body
    const metadata = await request.json();
    
    console.log("Received metadata:", metadata);
    
    // Here you would typically upload to Pinata or another IPFS service
    // For now, we'll simulate a successful upload with a fake CID
    // In a real implementation, replace this with actual Pinata API call
    
    // Simulate IPFS upload with a random CID
    const fakeCid = `bafybeie${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    // Simulate a slight delay like a real API call would have
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json({ 
      success: true, 
      cid: fakeCid
    });
  } catch (error) {
    console.error('Error uploading metadata:', error);
    return NextResponse.json(
      { error: 'Failed to upload metadata' },
      { status: 500 }
    );
  }
}