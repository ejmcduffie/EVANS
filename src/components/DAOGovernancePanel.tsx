'use client';

import React, { useState, useEffect } from 'react';

type DAO = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  treasury: number;
  proposals: Proposal[];
  isMember: boolean;
};

type Proposal = {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  startDate: string;
  endDate: string;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  totalVotes: number;
  createdBy: string;
  createdAt: string;
};

type VoteType = 'for' | 'against' | 'abstain';

type DAOGovernancePanelProps = {
  verificationPowerMultiplier?: number;
};

export default function DAOGovernancePanel({ verificationPowerMultiplier }: DAOGovernancePanelProps) {
  // Demo user is always authenticated
  const isAuthenticated = true;
  const [daos, setDaos] = useState<DAO[]>([]);
  const [selectedDao, setSelectedDao] = useState<DAO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proposalData, setProposalData] = useState({
    title: '',
    description: '',
    durationDays: 7,
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockDaos: DAO[] = [
          {
            id: 'dao-1',
            name: 'Smith Family DAO',
            description: 'Decentralized organization for the Smith family genealogy and heritage assets',
            memberCount: 42,
            treasury: 125000,
            isMember: true,
            proposals: [
              {
                id: 'prop-1',
                title: 'Fund digitization of family archives',
                description: 'Allocate 25,000 tokens to digitize and preserve historical family documents',
                status: 'active',
                startDate: '2025-06-20T00:00:00Z',
                endDate: '2025-06-27T23:59:59Z',
                votesFor: 12500,
                votesAgainst: 3200,
                votesAbstain: 1500,
                totalVotes: 17200,
                createdBy: '0x1234...abcd',
                createdAt: '2025-06-19T14:30:00Z',
              },
              {
                id: 'prop-2',
                title: 'Create family scholarship fund',
                description: 'Establish a scholarship program for family members pursuing higher education',
                status: 'passed',
                startDate: '2025-05-15T00:00:00Z',
                endDate: '2025-05-22T23:59:59Z',
                votesFor: 18900,
                votesAgainst: 2100,
                votesAbstain: 800,
                totalVotes: 21800,
                createdBy: '0x5678...efgh',
                createdAt: '2025-05-14T10:15:00Z',
              },
            ],
          },
          {
            id: 'dao-2',
            name: 'Johnson Heritage Foundation',
            description: 'Preserving and celebrating the Johnson family legacy',
            memberCount: 28,
            treasury: 87500,
            isMember: false,
            proposals: [],
          },
        ];

        setDaos(mockDaos);
        setSelectedDao(mockDaos[0]); // Select first DAO by default
      } catch (error) {
        console.error('Error fetching DAO data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Demo mode always fetches data
    fetchData();
  }, []);

  const calculateVotingPower = (tokenBalance: number, participationScore: number) => {
    const baseVotingPower = tokenBalance * (1 + participationScore/10);
    return verificationPowerMultiplier ? baseVotingPower * verificationPowerMultiplier : baseVotingPower;
  };

  const handleVote = (proposalId: string, vote: VoteType) => {
    // Implement voting functionality
    console.log(`Voting ${vote} on proposal ${proposalId}`);
  };

  const handleCreateProposal = () => {
    // Implement proposal creation
    console.log('Creating proposal:', proposalData);
    setIsModalOpen(false);
    // Reset form
    setProposalData({
      title: '',
      description: '',
      durationDays: 7,
    });
  };

  const handleJoinDAO = (daoId: string) => {
    // Implement DAO joining
    console.log('Joining DAO:', daoId);
  };

  if (status === 'loading') {
    return <div className="text-center py-8">Loading DAO governance...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Please sign in to access DAO governance features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Family DAO Governance</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* DAO List */}
        <div className="lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Your DAOs</h3>
            <button
              onClick={() => {}}
              className="text-sm text-primary hover:text-primary-dark"
            >
              + New DAO
            </button>
          </div>
          
          <div className="space-y-2">
            {daos.map((dao) => (
              <div
                key={dao.id}
                onClick={() => setSelectedDao(dao)}
                className={`p-3 rounded-lg cursor-pointer ${
                  selectedDao?.id === dao.id ? 'bg-gray-100 border-l-4 border-primary' : 'hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{dao.name}</div>
                <div className="text-sm text-gray-500">{dao.memberCount} members</div>
                {!dao.isMember && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinDAO(dao.id);
                    }}
                    className="mt-2 text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary-dark transition-colors"
                  >
                    Join DAO
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* DAO Details */}
        <div className="lg:col-span-3">
          {selectedDao ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold">{selectedDao.name}</h3>
                  <p className="text-gray-600">{selectedDao.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Treasury</div>
                  <div className="text-xl font-bold">${selectedDao.treasury.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium">Proposals</h4>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors text-sm"
                  disabled={!selectedDao.isMember}
                >
                  New Proposal
                </button>
              </div>
              
              {selectedDao.proposals.length > 0 ? (
                <div className="space-y-4">
                  {selectedDao.proposals.map((proposal) => {
                    const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
                    const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
                    const againstPercentage = totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0;
                    const abstainPercentage = totalVotes > 0 ? (proposal.votesAbstain / totalVotes) * 100 : 0;
                    
                    return (
                      <div key={proposal.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{proposal.title}</h5>
                            <p className="text-sm text-gray-600 mt-1">{proposal.description}</p>
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                proposal.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                proposal.status === 'passed' ? 'bg-green-100 text-green-800' :
                                proposal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {proposal.status.toUpperCase()}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">
                                Ends: {new Date(proposal.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Total Votes</div>
                            <div className="font-medium">{totalVotes.toLocaleString()}</div>
                          </div>
                        </div>
                        
                        {proposal.status === 'active' && (
                          <div className="mt-4">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500" 
                                style={{ width: `${forPercentage}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>For: {forPercentage.toFixed(1)}%</span>
                              <span>Against: {againstPercentage.toFixed(1)}%</span>
                              <span>Abstain: {abstainPercentage.toFixed(1)}%</span>
                            </div>
                            
                            <div className="mt-4 flex space-x-2">
                              <button
                                onClick={() => handleVote(proposal.id, 'for')}
                                className="flex-1 bg-green-100 text-green-800 py-2 px-3 rounded-md text-sm hover:bg-green-200 transition-colors"
                              >
                                Vote For
                              </button>
                              <button
                                onClick={() => handleVote(proposal.id, 'against')}
                                className="flex-1 bg-red-100 text-red-800 py-2 px-3 rounded-md text-sm hover:bg-red-200 transition-colors"
                              >
                                Vote Against
                              </button>
                              <button
                                onClick={() => handleVote(proposal.id, 'abstain')}
                                className="flex-1 bg-gray-100 text-gray-800 py-2 px-3 rounded-md text-sm hover:bg-gray-200 transition-colors"
                              >
                                Abstain
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      vectorEffect="non-scaling-stroke"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No proposals yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new proposal.</p>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      disabled={!selectedDao.isMember}
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      New Proposal
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">Select a DAO to get started</h3>
              <p className="mt-1 text-sm text-gray-500">Or create a new DAO for your family</p>
            </div>
          )}
        </div>
      </div>
      
      {/* New Proposal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Create New Proposal</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  id="title"
                  value={proposalData.title}
                  onChange={(e) => setProposalData({...proposalData, title: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Enter proposal title"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  rows={4}
                  value={proposalData.description}
                  onChange={(e) => setProposalData({...proposalData, description: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Describe your proposal in detail..."
                />
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Voting Duration (days)</label>
                <input
                  type="number"
                  id="duration"
                  min="1"
                  max="30"
                  value={proposalData.durationDays}
                  onChange={(e) => setProposalData({...proposalData, durationDays: parseInt(e.target.value)})}
                  className="mt-1 block w-20 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateProposal}
                  disabled={!proposalData.title || !proposalData.description}
                  className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    !proposalData.title || !proposalData.description
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
                  }`}
                >
                  Create Proposal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
