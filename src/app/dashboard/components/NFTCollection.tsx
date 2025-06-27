import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

type NFT = {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  transactionId: string;
  arweaveLink: string;
  mintedAt: Date;
  recordType?: string;
  agency?: string;
  relatedFile?: string;
};

export default function NFTCollection() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch NFTs from the in-memory API
  const fetchNFTs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/nft-collection?userId=default-user');
      
      if (!response.ok) {
        throw new Error('Failed to fetch NFT collection');
      }
      
      const data = await response.json();
      
      // Convert string dates to Date objects
      const nftsWithDates = data.nfts.map((nft: any) => ({
        ...nft,
        mintedAt: new Date(nft.mintedAt)
      }));
      
      setNfts(nftsWithDates);
    } catch (err) {
      console.error('Error fetching NFTs:', err);
      setError('Failed to load NFT collection');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save NFTs to the in-memory API
  const saveNFTs = async (updatedNFTs: NFT[]) => {
    try {
      const response = await fetch('/api/nft-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: 'default-user',
          nfts: updatedNFTs.map(nft => ({
            ...nft,
            // Convert Date to ISO string for JSON serialization
            mintedAt: nft.mintedAt.toISOString()
          }))
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save NFT collection');
      }
      
      // Refresh the NFT list after saving
      fetchNFTs();
    } catch (err) {
      console.error('Error saving NFTs:', err);
      setError('Failed to save NFT collection');
    }
  };

  // Load NFTs on component mount
  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  // Handle viewing NFT details
  const viewNFTDetails = (nft: NFT) => {
    window.open(nft.arweaveLink, '_blank');
  };

  // Handle deleting an NFT
  const handleDeleteNFT = async (nftId: string) => {
    if (window.confirm('Are you sure you want to delete this NFT? This action cannot be undone.')) {
      const updatedNFTs = nfts.filter(nft => nft.id !== nftId);
      await saveNFTs(updatedNFTs);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 my-6">
        <h2 className="text-xl font-bold mb-4">Your NFT Collection</h2>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 my-6">
        <h2 className="text-xl font-bold mb-4">Your NFT Collection</h2>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 my-6">
        <h2 className="text-xl font-bold mb-4">Your NFT Collection</h2>
        <p className="text-gray-500">
          You haven't minted any NFTs yet. Mint your first NFT by selecting a file from your dashboard and clicking "Mint NFT".
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 my-6">
      <h2 className="text-xl font-bold mb-4">Your NFT Collection</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.map((nft) => (
          <div key={nft.id} className="border rounded-lg overflow-hidden shadow-md transition-all hover:shadow-lg">
            <div className="relative h-48 w-full">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
              <Image 
                src={nft.imageUrl}
                alt={nft.name}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">{nft.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{nft.description}</p>
              <div className="text-xs text-gray-500 mb-1">Record Type: {nft.recordType || 'N/A'}</div>
              <div className="text-xs text-gray-500 mb-1">Agency: {nft.agency || 'N/A'}</div>
              <div className="text-xs text-gray-500 mb-1 truncate" title={nft.transactionId}>Tx: {nft.transactionId}</div>
              <div className="text-xs text-gray-500 mb-3">Minted: {nft.mintedAt.toLocaleDateString()}</div>
              <div className="flex space-x-2">
                <button
                  onClick={() => viewNFTDetails(nft)}
                  className="px-3 py-2 bg-indigo-100 text-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-200 transition-colors"
                >
                  View Details
                </button>
                <a
                  href={nft.arweaveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Blockchain Link
                </a>
                <button
                  onClick={() => handleDeleteNFT(nft.id)}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
