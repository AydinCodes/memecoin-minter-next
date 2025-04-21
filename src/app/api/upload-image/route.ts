// src/app/api/upload-image/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string; // Get the custom file name
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    console.log("Received file:", fileName || file.name, "Size:", file.size, "Type:", file.type);
    
    // In a production environment, you would now upload to Pinata using their API
    // For demonstration purposes with the ENV variables you provided:
    
    // If you have a Pinata JWT token in your environment variables, you can use it
    const pinataJWT = process.env.PINATA_JWT;
    const pinataGateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'olive-ready-turkey-58.mypinata.cloud';
    
    if (pinataJWT) {
      // Create a FormData object to send to Pinata
      const pinataFormData = new FormData();
      
      // If we have a custom fileName, create a new File object with that name
      if (fileName) {
        const newFile = new File([file], fileName, { type: file.type });
        pinataFormData.append('file', newFile);
      } else {
        pinataFormData.append('file', file);
      }
      
      // Add pin options as metadata
      const pinOptions = JSON.stringify({
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
      });
      pinataFormData.append('pinataOptions', pinOptions);
      
      // Add metadata
      const metadata = JSON.stringify({
        name: fileName || file.name,
        keyvalues: {
          app: "SolMinter",
          type: "token_image",
          timestamp: Date.now().toString()
        }
      });
      pinataFormData.append('pinataMetadata', metadata);
      
      // Send request to Pinata
      const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pinataJWT}`
        },
        body: pinataFormData
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
        fileName: fileName || file.name // Return the filename used
      });
    }
    
    // Fallback to fake CID if no Pinata API key (for development only)
    const fakeCid = `bafybeie${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    console.warn('Using fake CID because Pinata API credentials were not found');
    
    return NextResponse.json({ 
      success: true, 
      cid: fakeCid,
      gateway: pinataGateway || 'gateway.pinata.cloud',
      fileName: fileName || file.name // Return the filename used
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}