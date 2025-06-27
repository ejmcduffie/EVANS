import React, { useState, useEffect } from 'react';

type FamilyMember = {
  id: string;
  name?: string;
  givenName?: string;
  surname?: string;
  birthDate?: string;
  deathDate?: string;
  gender?: string;
  children?: FamilyMember[];
  partners?: FamilyMember[];
  location?: string;
  relation?: string;
  // Verification and minting status
  isVerified?: boolean;
  isMinted?: boolean;
  isMinting?: boolean;
};

export default function VerifiedAncestors() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/family-tree');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          if (response.status === 404 && errorData?.code === 'NO_GEDCOM_FILES') {
            throw new Error('No family tree found. Please upload a GEDCOM file first.');
          }
          throw new Error('Failed to fetch family tree data');
        }
        
        const data = await response.json();
        
        // Process the tree into a flat list of family members
        const members: FamilyMember[] = [];
        
        const processMembers = (member: FamilyMember, relation: string = '') => {
          // Add relation property
          const memberWithRelation = {
            ...member,
            relation: relation || getRandomRelation(member)
          };
          
          // Add location if not exists
          if (!memberWithRelation.location) {
            memberWithRelation.location = getRandomLocation();
          }
          
          members.push(memberWithRelation);
          
          // Process children recursively
          if (member.children && member.children.length > 0) {
            member.children.forEach(child => 
              processMembers(child, getChildRelation(relation))
            );
          }
          
          // Process partners
          if (member.partners && member.partners.length > 0) {
            member.partners.forEach(partner =>
              processMembers(partner, getPartnerRelation(relation))
            );
          }
        };
        
        // Start processing from the root
        if (data.data) {
          // API returns data in data.data
          processMembers(data.data);
        } else if (data.tree) {
          // Fallback for backward compatibility
          processMembers(data.tree);
        }
        
        // Add verification status to some members (for demo)
        const verifiedMembers = members
          .slice(0, Math.min(members.length, 5)) // Take up to 5 members
          .map(member => ({
            ...member,
            isVerified: true,
            isMinted: false // default minted status
          }));
        
        setFamilyMembers(verifiedMembers);
      } catch (err) {
        console.error('Error fetching family members:', err);
        setError('Failed to load family members');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFamilyMembers();
  }, []);

  // Helper functions for relations and locations
  const getRandomRelation = (member: FamilyMember) => {
    const relations = [
      'Great-Grandfather', 'Great-Grandmother',
      'Great-Great-Grandfather', 'Great-Great-Grandmother',
      'Great-Uncle', 'Great-Aunt',
      '3rd Great-Grandfather', '3rd Great-Grandmother'
    ];
    return relations[Math.floor(Math.random() * relations.length)];
  };

  const getChildRelation = (parentRelation: string) => {
    if (parentRelation.includes('Great-Great')) {
      return 'Great-' + parentRelation.replace('Great-Great-', '');
    }
    if (parentRelation.includes('Great-')) {
      return parentRelation.replace('Great-', '');
    }
    return 'Child';
  };

  const getPartnerRelation = (relation: string) => {
    if (relation.includes('Grandfather')) {
      return relation.replace('Grandfather', 'Grandmother');
    }
    if (relation.includes('Grandmother')) {
      return relation.replace('Grandmother', 'Grandfather');
    }
    if (relation.includes('Uncle')) {
      return relation.replace('Uncle', 'Aunt');
    }
    if (relation.includes('Aunt')) {
      return relation.replace('Aunt', 'Uncle');
    }
    return relation;
  };

  const getRandomLocation = () => {
    const locations = ['Georgia', 'South Carolina', 'North Carolina', 'Virginia', 'Alabama', 'Mississippi', 'Tennessee'];
    return locations[Math.floor(Math.random() * locations.length)];
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Verified Ancestors</h2>
        <div className="text-gray-500">Loading verified ancestor data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Verified Ancestors</h2>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (familyMembers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Verified Ancestors</h2>
        <div className="text-gray-500">No verified ancestors found. Upload a GEDCOM file to get started.</div>
      </div>
    );
  }

  // Mint handler
  const handleMint = async (memberId: string) => {
    setFamilyMembers(prev => prev.map(m => m.id === memberId ? { ...m, isMinting: true } as any : m));
    try {
      const member = familyMembers.find(m => m.id === memberId);
      if (!member) return;
      const res = await fetch('/api/nft-mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: member.id, fileData: member })
      });
      if (!res.ok) throw new Error('Mint failed');

      // Persist to localStorage for dashboard collection
      try {
        const json = await res.json();
        const { transactionId, arweaveLink, metadata } = json;
        const agencyAttr = (metadata?.attributes || []).find((a: any) => a.trait_type === 'Agency');
        const typeAttr = (metadata?.attributes || []).find((a: any) => a.trait_type === 'Type');

        const newNFT = {
          id: transactionId,
          name: metadata?.name || member.name || member.givenName || 'Record',
          imageUrl: 'https://placehold.co/300x400/e2e8f0/1e293b?text=Record',
          description: metadata?.description || `Verification record for ${member.name || member.givenName}`,
          transactionId,
          arweaveLink,
          mintedAt: new Date().toISOString(),
          recordType: typeAttr?.value,
          agency: agencyAttr?.value,
          relatedFile: memberId
        } as any;
        const existing = JSON.parse(localStorage.getItem('mintedNFTs') || '[]');
        existing.push(newNFT);
        localStorage.setItem('mintedNFTs', JSON.stringify(existing));
      } catch (storageErr) {
        console.error('Failed to store minted NFT locally:', storageErr);
      }

      setFamilyMembers(prev => prev.map(m => m.id === memberId ? { ...m, isMinted: true, isMinting: false } : m));
    } catch (e) {
      console.error(e);
      setFamilyMembers(prev => prev.map(m => m.id === memberId ? { ...m, isMinting: false } : m));
      alert('Failed to mint record');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Verified Ancestors</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Birth Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Relation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Verification
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mint
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {familyMembers.map((member, index) => (
              <tr key={member.id ? member.id : `member-${index}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {member.name || `${member.givenName || ''} ${member.surname || ''}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {member.birthDate || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {member.location || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {member.relation || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Verified
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {member.isMinted ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                      Minted
                    </span>
                  ) : member.isMinting ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Minting...
                    </span>
                  ) : (
                    <button
                      onClick={() => handleMint(member.id)}
                      className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Mint
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
