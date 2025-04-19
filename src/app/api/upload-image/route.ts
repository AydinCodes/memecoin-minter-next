// src/app/api/upload-image/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    console.log("Received file:", file.name, "Size:", file.size);
    
    // Here you would typically upload to Pinata or another IPFS service
    // For now, we'll simulate a successful upload with a fake CID
    // In a real implementation, replace this with actual Pinata API call
    
    // Simulate IPFS upload with a random CID
    const fakeCid = `bafybeie${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    // Simulate a slight delay like a real API call would have
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return NextResponse.json({ 
      success: true, 
      cid: fakeCid 
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}