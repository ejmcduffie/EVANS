import React, { useState } from 'react';

type DAOGovernancePanelProps = {
  verificationPowerMultiplier: number;
};

export default function DAOGovernancePanel({ verificationPowerMultiplier }: DAOGovernancePanelProps) {
  // Mock proposals
  const initialProposals = [
    { id: 'p1', title: 'Allocate 10% treasury to research archive digitization', yes: 42, no: 5, status: 'Active' },
    { id: 'p2', title: 'Partnership with Historical Society for data sharing', yes: 65, no: 3, status: 'Succeeded' },
    { id: 'p3', title: 'Introduce community grant program', yes: 17, no: 12, status: 'Defeated' }
  ];

  const [proposals, setProposals] = useState(initialProposals);
  const [votedIds, setVotedIds] = useState<string[]>([]);

  const handleVote = (id: string, vote: 'yes' | 'no') => {
    if (votedIds.includes(id)) return; // already voted
    setProposals(prev => prev.map(p => p.id === id ? { ...p, [vote]: p[vote] + 1 } as any : p));
    setVotedIds(prev => [...prev, id]);
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">DAO Governance Panel</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-500">Verification Power</div>
          <div className="text-2xl font-bold text-primary">{verificationPowerMultiplier.toFixed(1)}x</div>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-500">Delegated Votes</div>
          <div className="text-2xl font-bold text-primary">1,250</div>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-2">Active & Recent Proposals</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Proposal</th>
              <th className="px-4 py-2 text-left">Yes</th>
              <th className="px-4 py-2 text-left">No</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map(p => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-2 max-w-xs break-words">{p.title}</td>
                <td className="px-4 py-2">{p.yes}</td>
                <td className="px-4 py-2">{p.no}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.status === 'Active' ? 'bg-green-100 text-green-800' : p.status === 'Succeeded' ? 'bg-indigo-100 text-indigo-800' : 'bg-red-100 text-red-800'}`}>{p.status}</span>
                </td>
                <td className="px-4 py-2 space-x-1">
                  {p.status === 'Active' ? (
                    votedIds.includes(p.id) ? (
                      <span className="text-gray-500 text-xs">Voted</span>
                    ) : (
                      <>
                        <button onClick={() => handleVote(p.id, 'yes')} className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700">Yes</button>
                        <button onClick={() => handleVote(p.id, 'no')} className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700">No</button>
                      </>
                    )
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
