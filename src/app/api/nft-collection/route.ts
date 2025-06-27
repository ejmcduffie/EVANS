import { NextResponse } from 'next/server';

// In-memory store for NFT collections
let nftCollections: Record<string, any[]> = {};

export async function GET(request: Request) {
  try {
    // Get user ID from the query string - in production, use proper auth
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default-user';
    
    const nfts = nftCollections[userId] || [];
    
    return NextResponse.json({ nfts }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch NFT collection:', error);
    return NextResponse.json({ error: 'Failed to fetch NFT collection' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId = 'default-user', nfts } = body;
    
    if (!Array.isArray(nfts)) {
      return NextResponse.json({ error: 'NFTs must be an array' }, { status: 400 });
    }
    
    // Store the NFTs for this user
    nftCollections[userId] = nfts;
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to save NFT collection:', error);
    return NextResponse.json({ error: 'Failed to save NFT collection' }, { status: 500 });
  }
}
