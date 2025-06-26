import React, { useState, useEffect } from 'react';
import Image from 'next/image';

type NFT = {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  transactionId: string;
  arweaveLink: string;
  mintedAt: Date;
  relatedFile?: string;
};

export default function NFTCollection() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      setIsLoading(true);
      try {
        // In a production app, this would be a real API call
        // For demo purposes, we'll simulate a fetch from localStorage
        
        // Check if we have any minted NFTs in localStorage
        const storedNFTs = localStorage.getItem('mintedNFTs');
        let userNFTs: NFT[] = [];
        
        if (storedNFTs) {
          try {
            const parsedNFTs = JSON.parse(storedNFTs);
            // Ensure mintedAt is properly converted to Date objects
            userNFTs = parsedNFTs.map((nft: any) => ({
              ...nft,
              mintedAt: new Date(nft.mintedAt)
            }));
          } catch (error) {
            console.error('Error parsing stored NFTs:', error);
          }
        }
        
        // If no NFTs found in storage or parsing failed, use demo data
        if (userNFTs.length === 0) {
          userNFTs = [
            {
              id: 'nft1',
              name: 'Smith Family Marriage Certificate',
              imageUrl: 'https://placehold.co/300x400/e2e8f0/1e293b?text=Marriage+Certificate',
              description: 'Verified marriage certificate from 1923',
              transactionId: 'TX_abc123def',
              arweaveLink: 'https://arweave.net/TX_abc123def',
              mintedAt: new Date(Date.now() - 2*24*60*60*1000) // 2 days ago
            },
            {
              id: 'nft2',
              name: 'Historical Family Portrait',
              imageUrl: 'https://placehold.co/300x400/e2e8f0/1e293b?text=Family+Portrait',
              description: 'Authenticated family portrait from 1945',
              transactionId: 'TX_xyz789',
              arweaveLink: 'https://arweave.net/TX_xyz789',
              mintedAt: new Date(Date.now() - 5*24*60*60*1000) // 5 days ago
            }
          ];
        }
        
        setNfts(userNFTs);
      } catch (err) {
        console.error('Error fetching NFTs:', err);
        setError('Failed to load NFT collection');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNFTs();
  }, []);

  // Handle viewing NFT details
  const viewNFTDetails = (nft: NFT) => {
    window.open(nft.arweaveLink, '_blank');
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
              <div className="text-xs text-gray-500 mb-3">
                Minted: {nft.mintedAt.toLocaleDateString()}
              </div>
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
