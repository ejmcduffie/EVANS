"use client";

import React, { useState } from 'react';
import { useBalance } from '../contexts/BalanceContext';
import { useChainlinkData } from '../hooks/useChainlinkData';

const ChainlinkPriceDisplay: React.FC = () => {
  const { balance } = useBalance();
  const { 
    ancPrice, 
    arPrice, 
    linkPrice, 
    ancUsdBalance, 
    isLoading, 
    error,
    calculateStorageCost,
    purchaseStorage
  } = useChainlinkData(balance);

  const [storageAmount, setStorageAmount] = useState<number>(1);
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState<boolean | null>(null);

  const handleEstimateCost = async () => {
    const cost = await calculateStorageCost(storageAmount);
    setEstimatedCost(cost);
  };

  const handlePurchaseStorage = async () => {
    setIsPurchasing(true);
    setPurchaseSuccess(null);
    
    try {
      const success = await purchaseStorage(storageAmount);
      setPurchaseSuccess(success);
    } catch (err) {
      setPurchaseSuccess(false);
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return <div className="p-4 border rounded shadow-sm bg-gray-50">
      <p className="text-gray-600">Loading Chainlink price data...</p>
    </div>;
  }

  if (error) {
    return <div className="p-4 border rounded shadow-sm bg-red-50">
      <p className="text-red-600">Error: {error}</p>
      <p className="text-sm text-gray-600 mt-2">
        Make sure you have MetaMask installed and connected to the Polygon Amoy testnet.
      </p>
    </div>;
  }

  return (
    <div className="p-4 border rounded shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Chainlink Price Data</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-3 bg-blue-50 rounded">
          <div className="text-sm text-gray-600">ANC/USD</div>
          <div className="text-lg font-medium">${ancPrice.toFixed(2)}</div>
        </div>
        
        <div className="p-3 bg-green-50 rounded">
          <div className="text-sm text-gray-600">AR/USD</div>
          <div className="text-lg font-medium">${arPrice.toFixed(2)}</div>
        </div>
        
        <div className="p-3 bg-purple-50 rounded">
          <div className="text-sm text-gray-600">LINK/USD</div>
          <div className="text-lg font-medium">${linkPrice.toFixed(2)}</div>
        </div>
      </div>
      
      <div className="mb-6 p-4 bg-yellow-50 rounded">
        <div className="text-sm text-gray-600">Your ANC Balance</div>
        <div className="flex items-end gap-2">
          <div className="text-2xl font-bold">{balance.toFixed(2)} ANC</div>
          <div className="text-lg text-gray-700">(${ancUsdBalance.toFixed(2)} USD)</div>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-3">Purchase Storage</h3>
        
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Storage Amount (GB)</label>
            <input 
              type="number" 
              min="1"
              value={storageAmount} 
              onChange={(e) => setStorageAmount(parseInt(e.target.value) || 1)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <button 
            onClick={handleEstimateCost}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Estimate Cost
          </button>
          
          <button 
            onClick={handlePurchaseStorage}
            disabled={isPurchasing || !estimatedCost}
            className={`px-4 py-2 rounded ${
              isPurchasing || !estimatedCost 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isPurchasing ? 'Processing...' : 'Purchase Storage'}
          </button>
        </div>
        
        {estimatedCost !== null && (
          <div className="mt-3 p-3 bg-gray-50 rounded">
            <span className="font-medium">Estimated Cost:</span> {estimatedCost.toFixed(2)} ANC
          </div>
        )}
        
        {purchaseSuccess !== null && (
          <div className={`mt-3 p-3 rounded ${purchaseSuccess ? 'bg-green-50' : 'bg-red-50'}`}>
            {purchaseSuccess 
              ? 'Storage purchased successfully!' 
              : 'Failed to purchase storage. Please try again.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChainlinkPriceDisplay;
