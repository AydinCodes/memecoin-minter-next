// src/app/api/delete-pinata-files/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { uuid } = await request.json();
    
    if (!uuid) {
      return NextResponse.json(
        { error: 'UUID parameter is required' },
        { status: 400 }
      );
    }
    
    console.log(`Attempting to delete Pinata files with UUID: ${uuid}`);
    
    // Get Pinata credentials from environment variables
    const pinataJWT = process.env.PINATA_JWT;
    const pinataGateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';
    
    if (!pinataJWT) {
      console.warn('No Pinata JWT found in environment variables');
      return NextResponse.json(
        { error: 'Pinata API credentials not configured' },
        { status: 500 }
      );
    }
    
    // First, we need to get a list of all files
    const searchResponse = await fetch('https://api.pinata.cloud/data/pinList?status=pinned', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${pinataJWT}`
      }
    });
    
    if (!searchResponse.ok) {
      const searchError = await searchResponse.text();
      console.error('Error fetching pin list from Pinata:', searchError);
      return NextResponse.json(
        { error: `Failed to fetch file list from Pinata: ${searchError}` },
        { status: 500 }
      );
    }
    
    const pinListData = await searchResponse.json();
    
    // Find pins containing the UUID in their keyvalues metadata
    // @ts-ignore
    const pinsToDelete = pinListData.rows.filter(pin => {
      // Look for UUID in Pinata metadata keyvalues.sessionUuid
      const metadataMatch = pin.metadata?.keyvalues?.sessionUuid === uuid;
      // Also check in the name as a fallback in case keyvalues aren't used
      const nameMatch = pin.metadata?.name && pin.metadata.name.includes(uuid);
      
      return metadataMatch || nameMatch;
    });
    
    console.log(`Found ${pinsToDelete.length} files containing UUID: ${uuid}`);
    
    // Track deletion results
    const deletionResults = [];
    
    // Delete each matching pin
    for (const pin of pinsToDelete) {
      try {
        const deleteResponse = await fetch(`https://api.pinata.cloud/pinning/unpin/${pin.ipfs_pin_hash}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${pinataJWT}`
          }
        });
        
        if (deleteResponse.ok) {
          console.log(`Successfully deleted: ${pin.ipfs_pin_hash} (${pin.metadata?.name || 'unnamed'})`);
          deletionResults.push({
            cid: pin.ipfs_pin_hash,
            name: pin.metadata?.name || 'unnamed',
            status: 'deleted'
          });
        } else {
          const deleteError = await deleteResponse.text();
          console.error(`Failed to delete ${pin.ipfs_pin_hash}:`, deleteError);
          deletionResults.push({
            cid: pin.ipfs_pin_hash,
            name: pin.metadata?.name || 'unnamed',
            status: 'error',
            error: deleteError
          });
        }
      } catch (error) {
        console.error(`Error deleting ${pin.ipfs_pin_hash}:`, error);
        deletionResults.push({
          cid: pin.ipfs_pin_hash,
          name: pin.metadata?.name || 'unnamed',
          status: 'error',
          error: String(error)
        });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Deletion process completed for UUID: ${uuid}`,
      deletedCount: deletionResults.filter(r => r.status === 'deleted').length,
      errorCount: deletionResults.filter(r => r.status === 'error').length,
      details: deletionResults
    });
    
  } catch (error) {
    console.error('Error in delete-pinata-files endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process deletion request', details: String(error) },
      { status: 500 }
    );
  }
}