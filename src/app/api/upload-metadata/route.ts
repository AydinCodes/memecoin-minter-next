// src/app/api/upload-metadata/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the metadata from the request body
    const { metadata, fileName, pinataMetadata: customPinataMetadata } = await request.json();
    
    // Use the provided filename or create a default one
    const actualFileName = fileName || 'metadata.json';
    
    console.log("Received metadata for:", metadata.name);
    console.log("Using filename:", actualFileName);
    
    // In a production environment, you would now upload to Pinata using their API
    // For demonstration purposes with the ENV variables you provided:
    
    // If you have a Pinata JWT token in your environment variables, you can use it
    const pinataJWT = process.env.PINATA_JWT;
    const pinataGateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'olive-ready-turkey-58.mypinata.cloud';
    
    if (pinataJWT) {
      // Prepare pinata options and metadata
      const options = {
        cidVersion: 1,
        customPinPolicy: {
          regions: [
            {
              id: 'FRA1',
              desiredReplicationCount: 1
            },
            {
              id: 'NYC1',
              desiredReplicationCount: 1
            }
          ]
        }
      };
      
      // Create pinata metadata - either use the custom one passed or create a default
      const pinataMetadata = customPinataMetadata || {
        name: actualFileName,
        keyvalues: {
          app: "SolHype",
          type: "token_metadata",
          symbol: metadata.symbol,
          timestamp: Date.now().toString()
        }
      };
      
      // Send request to Pinata
      const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pinataJWT}`
        },
        body: JSON.stringify({
          pinataOptions: options,
          pinataMetadata: pinataMetadata,
          pinataContent: metadata
        })
      });
      
      if (!pinataResponse.ok) {
        const errorDetails = await pinataResponse.json();
        console.error('Pinata upload error:', errorDetails);
        return NextResponse.json(
          { error: `Failed to upload to Pinata: ${errorDetails.error || pinataResponse.statusText}` },
          { status: 500 }
        );
      }
      
      const pinataResult = await pinataResponse.json();
      
      return NextResponse.json({ 
        success: true, 
        cid: pinataResult.IpfsHash,
        gateway: pinataGateway,
        fileName: actualFileName
      });
    }
    
    // Fallback to fake CID if no Pinata API key (for development only)
    const fakeCid = `bafybeie${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    console.warn('Using fake CID because Pinata API credentials were not found');
    
    return NextResponse.json({ 
      success: true, 
      cid: fakeCid,
      gateway: pinataGateway || 'gateway.pinata.cloud',
      fileName: actualFileName
    });
  } catch (error) {
    console.error('Error uploading metadata:', error);
    return NextResponse.json(
      { error: 'Failed to upload metadata' },
      { status: 500 }
    );
  }
}