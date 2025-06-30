'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Mock components - replace with real imports when working
const DeFiDashboard = () => <div>DeFi Dashboard Content</div>;
const DAOGovernancePanel = () => <div>DAO Governance Content</div>;

export default function Verification() {
  const [activeTab, setActiveTab] = useState<'verification' | 'defi' | 'dao'>('verification');
  
  // Sample verification data
  const verificationData = {
    status: 'Verified',
    timestamp: '2025-05-25T14:32:10Z',
    blockchainNetwork: 'Polygon Testnet',
    transactionHash: '0x3a8d9b2c7d6e5f4a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d',
    contractAddress: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
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
              historical United States records. Our blockchain verification system ensures
              the authenticity and integrity of your ancestral connections.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Verification Process</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-3">1</div>
                  <div>
                    <h4 className="font-medium">File Upload</h4>
                    <p className="text-sm text-gray-600">Upload your genealogy GEDCOM files through our secure interface</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-3">2</div>
                  <div>
                    <h4 className="font-medium">Data Extraction</h4>
                    <p className="text-sm text-gray-600">We extract relevant ancestral information from your files</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-3">3</div>
                  <div>
                    <h4 className="font-medium">Blockchain Authentication</h4>
                    <p className="text-sm text-gray-600">Your data is securely hashed and recorded on the blockchain</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-3">4</div>
                  <div>
                    <h4 className="font-medium">Verification Complete</h4>
                    <p className="text-sm text-gray-600">Receive a verification certificate and proof of authenticity</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Verification Status</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">{verificationData.status}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date(verificationData.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Network:</span>
                  <span className="font-medium">{verificationData.blockchainNetwork}</span>
                </div>
                <div className="mb-2">
                  <span className="text-gray-600 block mb-1">Transaction:</span>
                  <span className="font-medium text-xs bg-gray-100 p-1 rounded block truncate">{verificationData.transactionHash}</span>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Contract:</span>
                  <span className="font-medium text-xs bg-gray-100 p-1 rounded block truncate">{verificationData.contractAddress}</span>
                </div>
              </div>
              
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
