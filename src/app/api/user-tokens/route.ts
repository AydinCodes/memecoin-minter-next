// src/app/api/user-tokens/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MintedTokenInfo } from '@/types/token';

export async function GET(request: NextRequest) {
  try {
    // Get the wallet public key from the query parameters
    const url = new URL(request.url);
    const publicKey = url.searchParams.get('publicKey');
    
    if (!publicKey) {
      return NextResponse.json(
        { error: 'Public key is required' },
        { status: 400 }
      );
    }
    
    console.log(`Searching for tokens minted by: ${publicKey}`);
    
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
    
    // Build the search query for Pinata - find files that contain the public key
    // but exclude files with 'image' or 'metadata' in their name
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
        { error: `Failed to search Pinata: ${searchError}` },
        { status: 500 }
      );
    }
    
    const pinListData = await searchResponse.json();
    
    // Filter pins to find the token metadata files:
    // 1. Contains the user's public key in the name 
    // 2. Does NOT contain 'metadata' or 'image' in the name
    // These should be the final token metadata files with the format: {public-key_token-id}
    const userTokenPins = pinListData.rows.filter((pin: any) => {
      const nameContainsPublicKey = pin.metadata?.name && pin.metadata.name.includes(publicKey);
      const isNotTempMetadata = pin.metadata?.name && 
        !pin.metadata.name.includes('metadata') && 
        !pin.metadata.name.includes('image');
      
      return nameContainsPublicKey && isNotTempMetadata;
    });
    
    console.log(`Found ${userTokenPins.length} tokens for wallet: ${publicKey}`);
    
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
          
          // Structure the token data
          return {
            name: metadata.name,
            symbol: metadata.symbol,
            description: metadata.description,
            mintAddress: metadata.mint,
            imageUrl: metadata.image,
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
      tokens: validTokens
    });
    
  } catch (error) {
    console.error('Error in user-tokens API:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve user tokens', details: String(error) },
      { status: 500 }
    );
  }
}