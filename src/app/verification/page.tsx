'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useBalance } from '@/contexts/BalanceContext';

// Mock components - replace with real imports when working
const DeFiDashboard = () => <div>DeFi Dashboard Content</div>;
const DAOGovernancePanel = () => <div>DAO Governance Content</div>;

// Define the structure of a family member (same as in genealogy page)
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
};

type FamilyTreeResponse = {
  tree: FamilyMember;
  fileName: string;
  uploadDate: string;
  warning?: string;
};

type VerificationRecord = {
  memberId: string;
  memberName: string;
  recordType: 'birth' | 'death' | 'marriage' | 'military';
  status: 'pending' | 'verified' | 'error';
  verificationAgency?: string;
  // NFT minting flags
  isMinted?: boolean;
  isMinting?: boolean;
};

export default function Verification() {
  const [activeTab, setActiveTab] = useState<'verification' | 'defi' | 'dao'>('verification');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Record<string, boolean>>({});
  const [selectedRecordType, setSelectedRecordType] = useState<'birth' | 'death' | 'marriage' | 'military'>('birth');
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const { adjustBalance } = useBalance();

  // Load verification records from API on component mount
  useEffect(() => {
    const fetchVerificationRecords = async () => {
      try {
        setLoading(true);
        // In a real app, you'd include proper auth - here we use default-user
        const userId = 'default-user';
        const response = await fetch(`/api/verification-records?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch verification records');
        }
        
        const data = await response.json();
        if (data.records && Array.isArray(data.records)) {
          setVerifications(data.records);
        }
      } catch (error) {
        console.error('Failed to load verification records from API:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVerificationRecords();
  }, []);

  // Save verification records to API whenever they change
  useEffect(() => {
    const saveVerificationRecords = async () => {
      try {
        // Don't save empty records or on initial load
        if (verifications.length === 0) return;
        
        // In a real app, you'd include proper auth
        const userId = 'default-user';
        const response = await fetch('/api/verification-records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, records: verifications })
        });
        
        if (!response.ok) {
          console.error('API returned error status when saving verification records');
        }
      } catch (error) {
        console.error('Failed to save verification records to API:', error);
      }
    };
    
    // Use a debounce to avoid too many API calls
    const timeoutId = setTimeout(saveVerificationRecords, 500);
    return () => clearTimeout(timeoutId);
  }, [verifications]);
  const [noGedcomFiles, setNoGedcomFiles] = useState(false);
  
  // Sample verification data
  const verificationData = {
    status: 'Verified',
    timestamp: '2025-05-25T14:32:10Z',
    blockchainNetwork: 'Polygon Testnet',
    transactionHash: '0x3a8d9b2c7d6e5f4a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d',
    contractAddress: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b'
  };
  
  // Function to fetch family members
  useEffect(() => {
    const fetchFamilyMembers = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch family tree data from API
        const response = await fetch('/api/family-tree');
        const data = await response.json();
        
        if (!response.ok) {
          // Handle NO_GEDCOM_FILES case specifically
          if (data.code === 'NO_GEDCOM_FILES') {
            setError(data.error || 'No GEDCOM file parsed yet. Please upload a GEDCOM file first.');
            setNoGedcomFiles(true);
            setFamilyMembers([]);
            return;
          }
          throw new Error(data.error || 'Failed to fetch family tree data');
        }
        
        setNoGedcomFiles(false);
        
        // Process the tree into a flat list of family members
        const members: FamilyMember[] = [];
        const processMembers = (member: FamilyMember) => {
          members.push(member);
          
          // Process children recursively
          if (member.children && member.children.length > 0) {
            member.children.forEach(processMembers);
          }
          
          // Process partners
          if (member.partners && member.partners.length > 0) {
            member.partners.forEach(processMembers);
          }
        };
        
        // Prefer flat individuals array if provided
        if (Array.isArray((data as any).individuals) && (data as any).individuals.length > 0) {
          setFamilyMembers((data as any).individuals as FamilyMember[]);
        } else {
          // Start processing from the root
          const rootNode = data.data || data.tree;
          if (rootNode) {
            processMembers(rootNode);
          }
          setFamilyMembers(members);
        }
      } catch (err) {
        console.error('Error fetching family members:', err);
        setError('Failed to load family members. Please ensure you have uploaded and processed a GEDCOM file.');
        setFamilyMembers([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (activeTab === 'verification') {
      fetchFamilyMembers();
    }
  }, [activeTab]);

  // Handle member selection
  const toggleMemberSelection = (id: string) => {
    setSelectedMembers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Government agencies for verification based on record type
  const getAgencyForRecordType = (recordType: string): string => {
    const agencies = {
      birth: [
        'U.S. National Archives - Birth Records Division',
        'Census Bureau Historical Records Office',
        'Department of Health Vital Statistics',
        'State Historical Society Archives'
      ],
      death: [
        'U.S. National Archives - Death Records Division',
        'Social Security Administration Records',
        'Veterans Affairs Historical Database',
        'County Public Health Records Office'
      ],
      marriage: [
        'County Clerk\'s Office Historical Archives',
        'U.S. Census Bureau Family Records Division',
        'State Judicial Historical Records',
        'National Archives Marriage Documentation Center'
      ],
      military: [
        'Department of Defense Personnel Archives',
        'National Military Personnel Records Center',
        'Veterans Affairs Military Service Division',
        'U.S. Army Historical Documentation Center'
      ]
    };
    
    // Select a random agency from the appropriate list
    const agencyList = agencies[recordType as keyof typeof agencies] || agencies.birth;
    return agencyList[Math.floor(Math.random() * agencyList.length)];
  };
  
  // Start verification process
  const startVerification = () => {
    const selectedIds = Object.keys(selectedMembers).filter(id => selectedMembers[id]);
    
    if (selectedIds.length === 0) {
      alert('Please select at least one family member to verify.');
      return;
    }
    
    // Create verification records for selected members
    const newVerifications = selectedIds.map(id => {
      const member = familyMembers.find(m => m.id === id);
      return {
        memberId: id,
        memberName: member?.name || 'Unknown',
        recordType: selectedRecordType,
        status: 'pending' as const,
        verificationAgency: getAgencyForRecordType(selectedRecordType),
        isMinted: false,
        isMinting: false
      };
    });
    
    // Deduct ANC balance ($1 per verification)
    adjustBalance(-selectedIds.length);
    // Add to existing verifications
    setVerifications(prev => [...prev, ...newVerifications]);
    
    // Simulate verification process
    newVerifications.forEach((record, index) => {
      setTimeout(() => {
        setVerifications(prev => 
          prev.map(r => 
            r.memberId === record.memberId && r.recordType === record.recordType
              ? { ...r, status: Math.random() > 0.2 ? 'verified' : 'error' }
              : r
          )
        );
      }, (index + 1) * 1500);
    });
    
    // Reset selections
    setSelectedMembers({});
  };

  // Mint handler
  const handleMint = async (
    memberId: string,
    recordType: 'birth' | 'death' | 'marriage' | 'military'
  ) => {
    // set minting flag
    setVerifications(prev =>
      prev.map(r =>
        r.memberId === memberId && r.recordType === recordType
          ? { ...r, isMinting: true }
          : r
      )
    );
    try {
      const record = verifications.find(
        r => r.memberId === memberId && r.recordType === recordType
      );
      if (!record) return;

      const res = await fetch('/api/nft-mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: memberId, fileData: record })
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
          name: metadata?.name || record.memberName,
          imageUrl: 'https://placehold.co/300x400/e2e8f0/1e293b?text=Record',
          description: metadata?.description || `Verification record for ${record.memberName}`,
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

      // Deduct ANC balance for minting ($2)
      adjustBalance(-2);
      // success – mark minted
      setVerifications(prev =>
        prev.map(r =>
          r.memberId === memberId && r.recordType === recordType
            ? { ...r, isMinted: true, isMinting: false }
            : r
        )
      );
    } catch (e) {
      console.error(e);
      setVerifications(prev =>
        prev.map(r =>
          r.memberId === memberId && r.recordType === recordType
            ? { ...r, isMinting: false }
            : r
        )
      );
      alert('Failed to mint record');
    }
  };

  // Tab rendering helper function
  const renderTab = (tabId: 'verification' | 'defi' | 'dao', label: string) => {
    return (
      <button
        key={tabId}
        onClick={() => setActiveTab(tabId)}
        className={`px-4 py-2 font-medium rounded-t-lg ${activeTab === tabId ? 'bg-white text-primary border-b-2 border-primary' : 'bg-gray-100 text-gray-600 hover:text-gray-800'}`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Blockchain Verification</h1>
      
      {/* Tab Navigation */}
      <div className="flex mb-6 border-b border-gray-200">
        {renderTab('verification', 'Verification Process')}
        {renderTab('defi', 'DeFi Integration')}
        {renderTab('dao', 'DAO Governance')}
      </div>
      
      {/* Tab Content */}
      {activeTab === 'verification' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="border-b pb-4 mb-4">
            <h2 className="text-xl font-bold mb-2">How Verification Works</h2>
            <p className="text-gray-700">
              AncestryChain uses Chainlink technology to verify your genealogy data against
              historical United States slave records. Our blockchain verification system ensures
              the authenticity and integrity of your ancestral connections.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Family Member Selection</h3>
              
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mr-2"></div>
                  <span>Loading family members...</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                  <p className="text-red-700">{error}</p>
                </div>
              ) : familyMembers.length === 0 ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <p className="text-yellow-700">No family members found. Please upload a GEDCOM file on the dashboard first.</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Select record type to verify:</label>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => setSelectedRecordType('birth')} 
                        className={`px-3 py-1 rounded-full text-sm ${selectedRecordType === 'birth' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
                      >
                        Birth Records
                      </button>
                      <button 
                        onClick={() => setSelectedRecordType('death')} 
                        className={`px-3 py-1 rounded-full text-sm ${selectedRecordType === 'death' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
                      >
                        Death Records
                      </button>
                      <button 
                        onClick={() => setSelectedRecordType('marriage')} 
                        className={`px-3 py-1 rounded-full text-sm ${selectedRecordType === 'marriage' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
                      >
                        Marriage Records
                      </button>
                      <button 
                        onClick={() => setSelectedRecordType('military')} 
                        className={`px-3 py-1 rounded-full text-sm ${selectedRecordType === 'military' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
                      >
                        Military Records
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white border rounded-lg overflow-hidden">
                    <div className="px-4 py-2 bg-gray-50 border-b">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Select Family Members</h4>
                        <span className="text-xs text-gray-500">{Object.values(selectedMembers).filter(Boolean).length} selected</span>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {familyMembers.map((member) => (
                        <div key={member.id} className="border-b last:border-b-0 px-4 py-3 hover:bg-gray-50">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`member-${member.id}`}
                              checked={!!selectedMembers[member.id]}
                              onChange={() => toggleMemberSelection(member.id)}
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <label htmlFor={`member-${member.id}`} className="ml-3 cursor-pointer flex-grow">
                              <div className="font-medium">{member.name}</div>
                              <div className="text-xs text-gray-500">
                                {member.birthDate && `b. ${member.birthDate}`}
                                {member.birthDate && member.deathDate && ' - '}
                                {member.deathDate && `d. ${member.deathDate}`}
                                {!member.birthDate && !member.deathDate && 'No dates available'}
                              </div>
                            </label>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center ${member.gender === 'M' ? 'bg-blue-100 text-blue-600' : member.gender === 'F' ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600'}`}>
                              {member.gender}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-3 bg-gray-50 border-t">
                      <button 
                        onClick={startVerification}
                        disabled={Object.values(selectedMembers).filter(Boolean).length === 0}
                        className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Verify Selected Records
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Verification Status</h3>
              
              {verifications.length > 0 ? (
                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-4 py-2 bg-gray-100 border-b">
                    <div className="grid grid-cols-5 gap-2">
                      <div className="font-medium">Family Member</div>
                      <div className="font-medium">Record Type</div>
                      <div className="font-medium">Status</div>
                      <div className="font-medium">Mint</div>
                      <div className="font-medium">Government Agency</div>
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {verifications.map((record, index) => (
                      <div key={`${record.memberId}-${record.recordType}-${index}`} className="border-b last:border-b-0 px-4 py-2 hover:bg-gray-50">
                        <div className="grid grid-cols-5 gap-2 items-center">
                          <div>{record.memberName}</div>
                          <div className="capitalize">{record.recordType}</div>
                          <div>
                            {record.status === 'pending' ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <svg className="animate-spin -ml-0.5 mr-1.5 h-2 w-2 text-yellow-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Pending
                              </span>
                            ) : record.status === 'verified' ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <svg className="-ml-0.5 mr-1.5 h-3 w-3 text-green-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <svg className="-ml-0.5 mr-1.5 h-3 w-3 text-red-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Error
                              </span>
                            )}
                          </div>
                          <div>
                            {record.status !== 'verified' ? (
                              <span className="text-xs text-gray-500">—</span>
                            ) : record.isMinted ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">Minted</span>
                            ) : record.isMinting ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Minting...</span>
                            ) : (
                              <button
                                onClick={() => handleMint(record.memberId, record.recordType)}
                                className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-600 text-white hover:bg-blue-700"
                              >
                                Mint
                              </button>
                            )}
                          </div>
                          <div className="text-xs text-gray-600">
                            {record.status === 'pending' ? (
                              'Pending verification...'
                            ) : record.status === 'verified' ? (
                              record.verificationAgency || 'U.S. National Archives'
                            ) : (
                              'Verification failed'
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-center py-6">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-2 text-gray-500">No verifications yet</p>
                    <p className="text-sm text-gray-400">Select family members and a record type to begin verification</p>
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <Link href="/dashboard" className="text-primary hover:text-primary-dark flex items-center">
                  <span>Return to Dashboard</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* DeFi Tab */}
      {activeTab === 'defi' && <DeFiDashboard />}
      
      {/* DAO Tab */}
      {activeTab === 'dao' && <DAOGovernancePanel />}
    </div>
  );
}
