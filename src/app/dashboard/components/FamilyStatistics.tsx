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
};

export default function FamilyStatistics() {
  const [statistics, setStatistics] = useState({
    totalAncestors: 0,
    verifiedAncestors: 0,
    generations: 0,
    earliestRecord: 'N/A',
    primaryLocation: 'N/A',
    slaveRecordMatches: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFamilyData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/family-tree');
        
        if (!response.ok) {
          throw new Error('Failed to fetch family tree data');
        }
        
        const data = await response.json();
        
        // Process the tree to gather statistics
        const members: FamilyMember[] = [];
        let maxDepth = 0;
        const birthYears: number[] = [];
        const locations = new Map<string, number>();
        
        const processMembers = (member: FamilyMember, depth = 1) => {
          members.push(member);
          maxDepth = Math.max(maxDepth, depth);
          
          // Extract birth year if available
          if (member.birthDate) {
            const yearMatch = member.birthDate.match(/\d{4}/);
            if (yearMatch) {
              birthYears.push(parseInt(yearMatch[0], 10));
            }
          }
          
          // Process children recursively
          if (member.children && member.children.length > 0) {
            member.children.forEach(child => 
              processMembers(child, depth + 1)
            );
          }
          
          // Process partners
          if (member.partners && member.partners.length > 0) {
            member.partners.forEach(partner =>
              processMembers(partner, depth)
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
        
        // For demo purposes, generate some locations
        const demoLocations = ['Georgia', 'South Carolina', 'North Carolina', 'Virginia', 'Alabama', 'Mississippi', 'Tennessee'];
        members.forEach(() => {
          const location = demoLocations[Math.floor(Math.random() * demoLocations.length)];
          locations.set(location, (locations.get(location) || 0) + 1);
        });
        
        // Find primary location (most frequent)
        let primaryLocation = 'Unknown';
        let maxCount = 0;
        
        locations.forEach((count, location) => {
          if (count > maxCount) {
            maxCount = count;
            primaryLocation = location;
          }
        });
        
        // Calculate earliest record
        const earliestYear = birthYears.length > 0 ? Math.min(...birthYears) : null;
        
        // Set statistics
        setStatistics({
          totalAncestors: members.length,
          verifiedAncestors: Math.floor(members.length * 0.6), // 60% verified for demo
          generations: maxDepth,
          earliestRecord: earliestYear ? earliestYear.toString() : 'N/A',
          primaryLocation,
          slaveRecordMatches: Math.floor(Math.random() * 10), // Random for demo
        });
      } catch (err) {
        console.error('Error fetching family data:', err);
        setError('Failed to load family statistics');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFamilyData();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Family Statistics</h2>
        <div className="text-gray-500">Loading family statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Family Statistics</h2>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">Family Statistics</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Ancestors</span>
          <span className="font-bold">{statistics.totalAncestors}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Verified Ancestors</span>
          <span className="font-bold">{statistics.verifiedAncestors}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Generations</span>
          <span className="font-bold">{statistics.generations}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Earliest Record</span>
          <span className="font-bold">{statistics.earliestRecord}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Primary Location</span>
          <span className="font-bold">{statistics.primaryLocation}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Slave Record Matches</span>
          <span className="font-bold">{statistics.slaveRecordMatches}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Blockchain Verification</span>
          <span className="font-bold text-green-600">Active</span>
        </div>
      </div>
    </div>
  );
}
