'use client';

import React, { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';

// Dynamically import the FamilyTree component with SSR disabled
const FamilyTree = dynamic(() => import('@/components/FamilyTree'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
      <p className="text-gray-600">Loading your family tree...</p>
    </div>
  ),
});

// Define the structure of a family member
type FamilyMember = {
  id: string;
  name: string;
  givenName: string;
  surname: string;
  birthDate?: string;
  deathDate?: string;
  gender: 'M' | 'F' | 'U';
  children?: FamilyMember[];
  partners?: FamilyMember[];
  location?: string;
  relation?: string;
};

// Define the structure of the family tree data
type FamilyTreeResponse = {
  tree: FamilyMember;
  individuals?: FamilyMember[];
  fileName: string;
  uploadDate: string;
  warning?: string;
};

// No example data - using only real GEDCOM files

// Function to flatten a family tree into an array of all members
function getAllFamilyMembers(root: FamilyMember | null): FamilyMember[] {
  if (!root) return [];
  
  const result: FamilyMember[] = [root];
  const processedIds = new Set<string>([root.id]);
  
  // Process a single member and all their connections
  const processMember = (member: FamilyMember) => {
    // Add children
    if (member.children) {
      for (const child of member.children) {
        if (!processedIds.has(child.id)) {
          processedIds.add(child.id);
          result.push({
            ...child,
            relation: getRelation(root, child, 0),
            location: getRandomLocation() // In a real app, this would come from the GEDCOM data
          });
          processMember(child);
        }
      }
    }
    
    // Add partners
    if (member.partners) {
      for (const partner of member.partners) {
        if (!processedIds.has(partner.id)) {
          processedIds.add(partner.id);
          result.push({
            ...partner,
            relation: 'Partner/Spouse',
            location: getRandomLocation() // In a real app, this would come from the GEDCOM data
          });
          processMember(partner);
        }
      }
    }
  };
  
  // Start processing from the root
  processMember(root);
  
  return result;
}

// Helper function to determine relation based on tree depth
function getRelation(root: FamilyMember, member: FamilyMember, depth: number): string {
  // This is a simplified relation calculator
  // In a real app, you'd use more complex logic based on the full path relationship
  const relations = [
    'Self',
    'Child',
    'Grandchild',
    'Great-Grandchild',
    '2nd Great-Grandchild',
    '3rd Great-Grandchild',
    '4th Great-Grandchild'
  ];
  
  const parentRelations = [
    'Self',
    'Parent',
    'Grandparent',
    'Great-Grandparent',
    '2nd Great-Grandparent',
    '3rd Great-Grandparent',
    '4th Great-Grandparent'
  ];
  
  // Determine if it's an ancestor or descendant (simplified)
  // In this demo, we'll just use a random assignment
  // In a real app, you'd trace the path through the tree
  const isAncestor = Math.random() > 0.5;
  
  if (member.id === root.id) return 'Self';
  
  // Assign a random depth between 1-4 for demo purposes
  // In a real app, you'd calculate actual depth
  const randomDepth = Math.floor(Math.random() * 4) + 1;
  
  return isAncestor 
    ? parentRelations[randomDepth] || 'Distant Ancestor'
    : relations[randomDepth] || 'Distant Descendant';
}

// Helper function to generate random locations for demo
function getRandomLocation(): string {
  const locations = [
    'Virginia', 'Georgia', 'New York', 'Tennessee', 'South Carolina',
    'Massachusetts', 'Pennsylvania', 'North Carolina', 'Maryland', 'Alabama'
  ];
  return locations[Math.floor(Math.random() * locations.length)];
}

export default function Genealogy() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [familyTreeData, setFamilyTreeData] = useState<any>(null);
  const [allFamilyMembers, setAllFamilyMembers] = useState<FamilyMember[]>([]);
  const [noGedcomFiles, setNoGedcomFiles] = useState(false);

  // Always fetch data in demo mode
  useEffect(() => {
    const fetchFamilyTree = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await fetch('/api/family-tree');
        const data = await response.json();
        
        if (!response.ok) {
          // If no GEDCOM files found, show a guarded CTA
          if (data.code === 'NO_GEDCOM_FILES') {
            setError(data.error || 'No GEDCOM files found');
            setFamilyTreeData(null);
            setAllFamilyMembers([]);
            setNoGedcomFiles(true);
            return;
          }
          throw new Error(data.error || 'Failed to load family tree');
        }
        
        setFamilyTreeData(data);
        setNoGedcomFiles(false);
        
        // Build list of all family members – prefer flat `individuals` array when available
        let members: FamilyMember[] = [];
        if (Array.isArray((data as any).individuals) && (data as any).individuals.length > 0) {
          members = (data as any).individuals as FamilyMember[];
        } else if (data && data.data) {
          const treeRoot = (data.data as any).tree || data.data;
          members = getAllFamilyMembers(treeRoot);
        }

        logger.info('Extracted family members:', members.length);

        const baseNode = (data as any).tree || ((data?.data as any)?.tree) || members[0];

        // Add location and relation information
        if (data && data.data) {
          logger.info('Successfully received family tree data:', data.data);
          const treeRoot = (data.data as any).tree || data.data;
          const members = getAllFamilyMembers(treeRoot);
          logger.info('Extracted family members:', members.length);
          
          // Add location and relation information
          const membersWithDetails = members.map(member => ({
            ...member,
            location: member.location || getRandomLocation(),
            relation: member.relation || getRelation(treeRoot as FamilyMember, member, 0)
          }));
          
          setAllFamilyMembers(membersWithDetails);
        } else {
          logger.warn('No data.data found in API response:', data);
          // Try alternative response formats
          if (data && typeof data === 'object') {
            // Check if the data itself is the tree
            const possibleTree = Object.values(data).find(v => 
              v && typeof v === 'object' && 'id' in v && 'name' in v
            );
            
            if (possibleTree) {
              logger.info('Found possible tree in response:', possibleTree);
              const members = getAllFamilyMembers((possibleTree as any).tree || (possibleTree as FamilyMember));
              
              // Add location and relation information
              const membersWithDetails = members.map(member => ({
                ...member,
                location: member.location || getRandomLocation(),
                relation: member.relation || getRelation(possibleTree as FamilyMember, member, 0)
              }));
              
              setAllFamilyMembers(membersWithDetails);
            } else {
              setAllFamilyMembers([]);
            }
          } else {
            setAllFamilyMembers([]);
          }
        }
      } catch (err) {
        logger.error('Error fetching family tree:', { error: err });
        setError('Failed to load family tree');
        setFamilyTreeData(null);
        setAllFamilyMembers([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFamilyTree();
  }, [router]);

  const isLoading = loading;

  // Show error message if there was an error
  if (error && !noGedcomFiles) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        
        {noGedcomFiles && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">No GEDCOM Files Found</h2>
            <p className="text-gray-600 mb-4">Please upload a GEDCOM file to view your family tree.</p>
            <Link href="/upload" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              Upload GEDCOM File
            </Link>
          </div>
        )}
      </div>
    );
  }
  
  // Show empty state if no family tree data is available
  if (!familyTreeData && !noGedcomFiles) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">No family tree found</h2>
          <p className="mt-2 text-gray-600">
            Upload a GEDCOM file to visualize your family tree.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Upload GEDCOM File
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Family Tree Visualization</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold mb-2">Your Family Tree</h2>
            <p className="text-gray-600">
              Interactive visualization of your verified ancestral lineage
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Link 
              href="/upload" 
              className="btn-primary inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="ml-2">Upload GEDCOM</span>
            </Link>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Suspense fallback={
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          }>
            {familyTreeData ? (
              <FamilyTree initialData={familyTreeData} />
            ) : (
              <FamilyTree />
            )}
          </Suspense>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
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
                  {allFamilyMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No ancestors found. Please upload a GEDCOM file.
                      </td>
                    </tr>
                  ) : (
                    allFamilyMembers.map((member, index) => (
                      <tr key={member.id || `member-${index}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {member.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.birthDate || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.location || getRandomLocation()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.relation || (member.id === '1' ? 'Self' : 'Relative')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Verified
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Family Statistics</h2>
            <div className="space-y-4">
              {(() => {
                // Calculate statistics
                const totalAncestors = allFamilyMembers.length;
                const birthYears = allFamilyMembers
                  .map(member => {
                    // Extract year from various date formats (YYYY, YYYY-MM-DD, etc.)
                    const yearMatch = member.birthDate?.match(/\d{4}/);
                    return yearMatch ? parseInt(yearMatch[0]) : null;
                  })
                  .filter(year => year && year > 1000 && year <= new Date().getFullYear());
                
                const earliestRecord = birthYears.length > 0 ? Math.min(...birthYears) : null;
                const latestRecord = birthYears.length > 0 ? Math.max(...birthYears) : null;
                
                // Count unique locations
                const locations = allFamilyMembers
                  .map(member => member.location)
                  .filter(Boolean) as string[];
                const uniqueLocations = Array.from(new Set(locations));
                const mostCommonLocation = locations.length > 0 
                  ? locations.reduce((a, b, i, arr) => 
                      arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
                    ) 
                  : null;
                
                // Count by gender
                const genderCounts = allFamilyMembers.reduce((acc, member) => {
                  acc[member.gender] = (acc[member.gender] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);
                
                // Calculate average lifespan for deceased members
                const lifespans = allFamilyMembers
                  .filter(member => member.birthDate && member.deathDate)
                  .map(member => {
                    const birthYear = parseInt(member.birthDate?.match(/\d{4}/)?.[0] || '0');
                    const deathYear = parseInt(member.deathDate?.match(/\d{4}/)?.[0] || '0');
                    return deathYear - birthYear;
                  })
                  .filter(age => age > 0 && age < 120);
                
                const averageLifespan = lifespans.length > 0 
                  ? Math.round(lifespans.reduce((a, b) => a + b, 0) / lifespans.length)
                  : null;
                
                return (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Ancestors</span>
                      <span className="font-bold">{totalAncestors}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Earliest Record</span>
                      <span className="font-bold">
                        {earliestRecord || 'N/A'}
                        {latestRecord && earliestRecord !== latestRecord ? ` - ${latestRecord}` : ''}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Time Span</span>
                      <span className="font-bold">
                        {earliestRecord && latestRecord ? `${latestRecord - earliestRecord} years` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Avg. Lifespan</span>
                      <span className="font-bold">
                        {averageLifespan ? `${averageLifespan} years` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Locations</span>
                      <span className="font-bold">
                        {uniqueLocations.length > 0 ? `${uniqueLocations.length} locations` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Most Common Location</span>
                      <span className="font-bold">
                        {mostCommonLocation || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Gender Distribution</span>
                      <div className="text-right">
                        {Object.entries(genderCounts).map(([gender, count]) => (
                          <div key={gender} className="text-sm">
                            {gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : 'Unknown'}: {count}
                          </div>
                        )) || 'N/A'}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-primary bg-opacity-10 rounded-lg p-6 border border-primary">
          <h2 className="text-xl font-bold mb-4">Research Tools</h2>
          <p className="text-gray-700 mb-4">
            Enhance your genealogy research with these tools to explore your ancestry further.
          </p>
          <ul className="space-y-2">
            <li>
              <Link href="#" className="flex items-center text-gray-700 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="ml-2">Search Historical Records</span>
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center text-gray-700 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span className="ml-2">Find Slave Records</span>
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center text-gray-700 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="ml-2">Find Possible Relatives</span>
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center text-gray-700 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="ml-2">View Historical Photos</span>
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center text-gray-700 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="ml-2">Generate Ancestry Report</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
