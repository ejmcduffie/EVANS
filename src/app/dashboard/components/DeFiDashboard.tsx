import React from 'react';

type DeFiDashboardProps = {
  verificationBoost: number;
};

export default function DeFiDashboard({ verificationBoost }: DeFiDashboardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">DeFi Dashboard</h2>
      <p className="text-gray-600 mb-4">
        This feature is under development. Your current verification boost: {verificationBoost}x
      </p>
      <div className="bg-gray-100 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center text-gray-500">
        DeFi Integration Coming Soon
      </div>
    </div>
  );
}
