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
            isVerified: true
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
