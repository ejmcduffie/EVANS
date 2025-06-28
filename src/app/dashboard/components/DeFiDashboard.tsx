import React from 'react';
import { useBalance } from '@/contexts/BalanceContext';

type DeFiDashboardProps = {
  verificationBoost: number;
};

export default function DeFiDashboard({ verificationBoost }: DeFiDashboardProps) {
  const { balance } = useBalance();

  // Mock earning NFTs
  const nftYields = [
    { id: 'n1', name: 'Direwolf Sigil', imageUrl: 'https://placehold.co/60x60/e2e8f0/1e293b?text=NFT', dailyYield: 0.8 },
    { id: 'n2', name: 'Winter Token', imageUrl: 'https://placehold.co/60x60/e2e8f0/1e293b?text=NFT', dailyYield: 0.5 }
  ];

  // Simple stat card helper
  const StatCard = ({ label, value }: { label: string; value: string }) => (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-xl font-bold text-primary">{value}</div>
    </div>
  );
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">DeFi Dashboard</h2>
      {/* Wallet & Boost */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Wallet</h3>
          <div className="bg-gray-100 rounded-lg p-4 text-sm break-all">0x3A4b...E12F</div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Verification Boost</h3>
          <div className="bg-gray-100 rounded-lg p-4 text-xl font-bold text-primary">{verificationBoost}x</div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="ANC Balance" value={`$${balance.toFixed(2)}`} />
        <StatCard label="Staked ANC" value="$250" />
        <StatCard label="Lifetime Earnings" value="$37.5" />
        <StatCard label="Current APY" value="12.3%" />
      </div>

      {/* NFTs */}
      <h3 className="text-lg font-semibold mb-2">Earning NFTs</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">NFT</th>
              <th className="px-4 py-2 text-left">Daily Yield</th>
            </tr>
          </thead>
          <tbody>
            {nftYields.map((nft) => (
              <tr key={nft.id} className="border-t">
                <td className="px-4 py-2 flex items-center space-x-2">
                  <img src={nft.imageUrl} alt={nft.name} className="w-8 h-8 rounded" />
                  <span>{nft.name}</span>
                </td>
                <td className="px-4 py-2">{nft.dailyYield} ANC</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
