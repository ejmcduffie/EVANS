import React, { useState, useEffect } from 'react';

interface FamilyStats {
  totalAncestors: number;
  verifiedAncestors: number;
  generations: number;
  earliestRecord: string;
  primaryLocation: string;
  nobleHouses: number;
}

const FamilyStatistics: React.FC = () => {
  const [statistics] = useState<FamilyStats>({
    totalAncestors: 42,
    verifiedAncestors: 28,
    generations: 8,
    earliestRecord: 'Age of Heroes',
    primaryLocation: 'Winterfell, The North',
    nobleHouses: 12,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);

  // Simulate loading with House Stark data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">House Stark Lineage</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">House Stark Lineage</h2>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold mb-6">House Stark Lineage</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Known Ancestors</h3>
          <p className="text-2xl font-bold">{statistics.totalAncestors}+</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Verified Records</h3>
          <p className="text-2xl font-bold">{statistics.verifiedAncestors}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Generations</h3>
          <p className="text-2xl font-bold">{statistics.generations}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Earliest Record</h3>
          <p className="text-lg font-medium">{statistics.earliestRecord}</p>
        </div>
        <div className="col-span-2">
          <h3 className="text-sm font-medium text-gray-500">Ancestral Seat</h3>
          <p className="text-lg font-medium">{statistics.primaryLocation}</p>
        </div>
        <div className="col-span-2">
          <h3 className="text-sm font-medium text-gray-500">Allied Noble Houses</h3>
          <p className="text-2xl font-bold">{statistics.nobleHouses}</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500 italic">
          "Winter is Coming" - House Stark words
        </p>
      </div>
    </div>
  );
};

export default FamilyStatistics;
