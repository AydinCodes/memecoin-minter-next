// src/app/api/user-tokens/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MintedTokenInfo } from '@/types/token';

export async function GET(request: NextRequest) {
  try {
    // Get the wallet public key from the query parameters
    const url = new URL(request.url);
    const publicKey = url.searchParams.get('publicKey');
    const pageOffset = parseInt(url.searchParams.get('pageOffset') || '0', 10);
    const initialLoad = pageOffset === 0;
    
    if (!publicKey) {
      return NextResponse.json(
        { error: 'Public key is required' },
        { status: 400 }
      );
    }
    
    console.log(`Searching for tokens minted by: ${publicKey}, pageOffset: ${pageOffset}`);
    
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
    
    // Fetch one page of pins
    const pageLimit = 1000; // Max allowed by Pinata
    
    try {
      console.log(`Fetching pins page with offset: ${pageOffset}, limit: ${pageLimit}`);
      const response = await fetch(
        `https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=${pageLimit}&pageOffset=${pageOffset}`, 
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${pinataJWT}`
          }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching pin list from Pinata:', errorText);
        return NextResponse.json(
          { error: `Failed to search Pinata: ${errorText}` },
          { status: 500 }
        );
      }
      
      const data = await response.json();
      console.log(`Fetched ${data.rows?.length || 0} pins for page offset ${pageOffset}`);
      
      // Check if we have more pages to fetch
      const hasMorePages = data.rows && data.rows.length === pageLimit;
      
      // Filter pins to find the token metadata files that belong to this user
      const userTokenPins = (data.rows || []).filter((pin: any) => {
        const nameContainsPublicKey = pin.metadata?.name && pin.metadata.name.includes(publicKey);
        
        // Skip temporary files or files with specific patterns in the name
        const isNotTempFile = pin.metadata?.name && 
          !pin.metadata.name.includes('_metadata.json') && 
          !pin.metadata.name.includes('_image.');
        
        return nameContainsPublicKey && isNotTempFile;
      });
      
      console.log(`Found ${userTokenPins.length} tokens for wallet in this page: ${publicKey}`);
      
      // For each pin, fetch and parse the token metadata
      const tokens: MintedTokenInfo[] = await Promise.all(
        userTokenPins.map(async (pin: any) => {
          try {
            const ipfsUrl = `https://${pinataGateway}/ipfs/${pin.ipfs_pin_hash}`;
            const response = await fetch(ipfsUrl);
            
            if (!response.ok) {
              console.error(`Failed to fetch metadata from ${ipfsUrl}`);
              return null;
            }
            
            const metadata = await response.json();
            
            // Fix for image URL - make sure we preserve the actual image URL
            const imageUrl = metadata.image || null;
            
            // Structure the token data
            return {
              name: metadata.name,
              symbol: metadata.symbol,
              description: metadata.description,
              mintAddress: metadata.mint || '',
              imageUrl: imageUrl, // Use the actual image URL 
              creator: metadata.creator,
              tokenInfo: metadata.tokenInfo,
              authorities: metadata.authorities,
              website: metadata.website,
              twitter: metadata.twitter,
              telegram: metadata.telegram,
              discord: metadata.discord,
              metadataUrl: ipfsUrl,
              pinHash: pin.ipfs_pin_hash,
            } as MintedTokenInfo;
          } catch (err) {
            console.error(`Error processing pin ${pin.ipfs_pin_hash}:`, err);
            return null;
          }
        })
      );
      
      // Filter out any null entries from errors
      const validTokens = tokens.filter(token => token !== null) as MintedTokenInfo[];
      
      return NextResponse.json({
        success: true,
        count: validTokens.length,
        tokens: validTokens,
        hasMorePages,
        nextPageOffset: hasMorePages ? pageOffset + pageLimit : null
      });
      
    } catch (error) {
      console.error('Error during pin fetching:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve user tokens', details: String(error) },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error in user-tokens API:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve user tokens', details: String(error) },
      { status: 500 }
    );
  }
}