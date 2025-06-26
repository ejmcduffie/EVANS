import React from 'react';

type DashboardHeaderProps = {
  activeTab: 'overview' | 'defi' | 'dao';
  setActiveTab: (tab: 'overview' | 'defi' | 'dao') => void;
  verificationBoost: number;
  verificationPowerMultiplier: number;
};

export default function DashboardHeader({
  activeTab,
  setActiveTab,
  verificationBoost,
  verificationPowerMultiplier
}: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">AncestryChain Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Welcome to your ancestry verification dashboard. Manage your files, track verification status, and interact with DeFi and DAO features.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-800">Verification Boost</h3>
          <p className="text-2xl font-bold text-primary">{verificationBoost}x</p>
          <p className="text-sm text-gray-600">Earnings multiplier</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-800">Verification Power</h3>
          <p className="text-2xl font-bold text-primary">{verificationPowerMultiplier}x</p>
          <p className="text-sm text-gray-600">Governance voting</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-800">Files Uploaded</h3>
          <p className="text-2xl font-bold text-primary">12</p>
          <p className="text-sm text-gray-600">Historical records</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'overview' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'defi' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('defi')}
        >
          DeFi Integration
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'dao' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('dao')}
        >
          DAO Governance
        </button>
      </div>
    </div>
  );
}
