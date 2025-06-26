'use client';

import React, { useState, useEffect } from 'react';

type StakingPool = {
  id: string;
  name: string;
  apy: number;
  tvl: number;
  stakedAmount?: number;
  rewards?: number;
};

type Loan = {
  id: string;
  collateralNftId: string;
  collateralName: string;
  loanAmount: number;
  value: number;
  ltv: number;
  status: 'active' | 'repaid' | 'liquidated';
  dueDate: string;
};

type DeFiDashboardProps = {
  verificationBoost?: number;
};

export default function DeFiDashboard({ verificationBoost }: DeFiDashboardProps) {
  // Demo user is always authenticated
  const isAuthenticated = true;
  const [stakingPools, setStakingPools] = useState<StakingPool[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'staking' | 'loans'>('staking');

  // Adjust APY if verification boost is provided
  const apyMultiplier = verificationBoost ? (1 + verificationBoost/100) : 1;

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStakingPools([
          {
            id: 'pool-1',
            name: 'Heritage Staking',
            apy: parseFloat((12.5 * apyMultiplier).toFixed(1)),
            tvl: 1250000,
            stakedAmount: 2500,
            rewards: 125
          },
          {
            id: 'pool-2',
            name: 'Genealogy Validators',
            apy: 8.2,
            tvl: 890000,
            stakedAmount: 0
          }
        ]);

        setLoans([
          {
            id: 'loan-1',
            collateralNftId: 'nft-123',
            collateralName: 'Family Bible Record',
            loanAmount: 5000,
            value: 10000,
            ltv: 50,
            status: 'active',
            dueDate: '2025-12-31'
          }
        ]);
      } catch (error) {
        console.error('Error fetching DeFi data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Demo mode always fetches data
    fetchData();
  }, []);

  const handleStake = (poolId: string) => {
    // Implement stake functionality
    console.log('Staking in pool:', poolId);
  };

  const handleUnstake = (poolId: string) => {
    // Implement unstake functionality
    console.log('Unstaking from pool:', poolId);
  };

  const handleBorrow = () => {
    // Implement borrow functionality
    console.log('Initiating new loan');
  };

  // Loading state for demo mode
  if (isLoading) {
    return <div className="text-center py-8">Loading DeFi dashboard...</div>;
  }
  
  // In demo mode, user is always authenticated

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">DeFi Dashboard</h2>
      
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('staking')}
            className={`${activeTab === 'staking' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Staking Pools
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`${activeTab === 'loans' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            My Loans
          </button>
        </nav>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading data...</div>
      ) : activeTab === 'staking' ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">Available Staking Pools</h3>
            <span className="text-sm text-gray-500">APY is variable and updated weekly</span>
          </div>
          
          <div className="space-y-4">
            {stakingPools.map((pool) => (
              <div key={pool.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{pool.name}</h4>
                    <p className="text-sm text-gray-500">TVL: ${pool.tvl.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{pool.apy}% APY</div>
                    {pool.stakedAmount ? (
                      <div className="text-sm">Staked: ${pool.stakedAmount.toLocaleString()}</div>
                    ) : null}
                  </div>
                </div>
                
                {pool.stakedAmount ? (
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => handleStake(pool.id)}
                      className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
                    >
                      Add to Stake
                    </button>
                    <button
                      onClick={() => handleUnstake(pool.id)}
                      className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Unstake
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStake(pool.id)}
                    className="mt-4 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
                  >
                    Stake Now
                  </button>
                )}
                
                {pool.rewards ? (
                  <div className="mt-3 text-sm text-green-600">
                    Rewards available: ${pool.rewards.toLocaleString()}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">My Collateralized Loans</h3>
            <button
              onClick={handleBorrow}
              className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors text-sm"
            >
              New Loan
            </button>
          </div>
          
          {loans.length > 0 ? (
            <div className="space-y-4">
              {loans.map((loan) => (
                <div key={loan.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{loan.collateralName}</h4>
                      <p className="text-sm text-gray-500">Collateral ID: {loan.collateralNftId}</p>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {loan.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">${loan.loanAmount.toLocaleString()}</div>
                      <div className="text-sm">LTV: {loan.ltv}%</div>
                      <div className="text-sm text-gray-500">Due: {new Date(loan.dueDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-500">Collateral Value</div>
                      <div className="font-medium">${loan.value.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Borrowed</div>
                      <div className="font-medium">${loan.loanAmount.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-3">
                    <button className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors">
                      Repay
                    </button>
                    <button className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
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
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No active loans</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new loan using your heritage NFTs as collateral.</p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleBorrow}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  New Loan
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
