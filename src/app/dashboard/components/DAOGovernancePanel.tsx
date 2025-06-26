import React from 'react';

type DAOGovernancePanelProps = {
  verificationPowerMultiplier: number;
};

export default function DAOGovernancePanel({ verificationPowerMultiplier }: DAOGovernancePanelProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">DAO Governance Panel</h2>
      <p className="text-gray-600 mb-4">
        This feature is under development. Your current verification power: {verificationPowerMultiplier}x
      </p>
      <div className="bg-gray-100 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center text-gray-500">
        DAO Governance Coming Soon
      </div>
    </div>
  );
}
