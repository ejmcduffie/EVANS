import { NextRequest, NextResponse } from 'next/server';

// Mock implementation for arbundles
const createMockTransaction = (data: string) => {
  return {
    id: 'TX_' + Math.random().toString(36).substr(2, 9),
    data,
    sign: async () => Promise.resolve(true)
  };
};

type VerificationRecord = {
  memberId: string;
  memberName: string;
  recordType: string;
  status: string;
  verificationAgency?: string;
};

export async function POST(request: NextRequest) {
  try {
    const { fileId, fileData }: { fileId: string; fileData: VerificationRecord } = await request.json();

    if (!fileId || !fileData) {
      return NextResponse.json(
        { error: 'Missing required fields: fileId and fileData are required' },
        { status: 400 }
      );
    }

    // 1. Local verification (mocked for development)
    // In a production environment, you would verify with Chainlink here
    const isVerified = true; // Mock verification success

    if (!isVerified) {
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 400 }
      );
    }

    // 2. Create metadata for the NFT
    const metadata = {
      fileId,
      name: `Verification Record: ${fileData.memberName}`,
      description: `Verification record for ${fileData.memberName} (${fileData.recordType})`,
      attributes: [
        {
          trait_type: 'Type',
          value: fileData.recordType
        },
        {
          trait_type: 'Status',
          value: fileData.status
        },
        {
          trait_type: 'Agency',
          value: fileData.verificationAgency || 'Self-verified'
        },
        {
          display_type: 'date',
          trait_type: 'Verification Date',
          value: Math.floor(Date.now() / 1000)
        }
      ]
    };

    // 3. Store metadata (mock implementation)
    const data = JSON.stringify(metadata);
    const mockTransaction = createMockTransaction(data);
    await mockTransaction.sign();
    const transactionId = mockTransaction.id;

    // 4. Save the NFT to the user's collection
    const nft = {
      id: `nft-${Date.now()}`,
      name: metadata.name,
      imageUrl: '/images/nft-placeholder.png', // Default image
      description: metadata.description,
      transactionId,
      arweaveLink: `https://arweave.net/${transactionId}`,
      mintedAt: new Date(),
      recordType: fileData.recordType,
      agency: fileData.verificationAgency,
      relatedFile: fileId
    };

    // Save to the NFT collection
    const userId = 'default-user'; // In a real app, get this from the session
    const collectionsResponse = await fetch(`${request.nextUrl.origin}/api/nft-collection?userId=${userId}`);
    const { nfts: existingNfts = [] } = await collectionsResponse.json();
    
    await fetch(`${request.nextUrl.origin}/api/nft-collection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        nfts: [...existingNfts, nft]
      })
    });

    // 5. Return success response
    return NextResponse.json({
      success: true,
      transactionId,
      arweaveLink: `https://arweave.net/${transactionId}`,
      message: 'NFT minted successfully!',
      metadata,
      nft
    });

  } catch (error: any) {
    console.error('NFT mint error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to mint NFT', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
