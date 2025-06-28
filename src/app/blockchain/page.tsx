'use client';

import React from 'react';
import ChainlinkPriceDisplay from '../../components/ChainlinkPriceDisplay';
import { useBalance } from '../../contexts/BalanceContext';

export default function BlockchainPage() {
  const { balance } = useBalance();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Blockchain Integration</h1>
      
      <div className="mb-8">
        <p className="text-lg mb-4">
          This page demonstrates the integration with Chainlink price feeds on the Polygon Amoy testnet.
          The smart contracts use Chainlink oracles to get real-time price data for ANC, AR, and LINK tokens.
        </p>
        <p className="mb-4">
          Your current ANC balance: <span className="font-bold">{balance.toFixed(2)} ANC</span>
        </p>
      </div>
      
      <div className="mb-8">
        <ChainlinkPriceDisplay />
      </div>
      
      <div className="bg-blue-50 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">About This Integration</h2>
        <p className="mb-2">
          This integration demonstrates how the AncestryChain platform uses Chainlink price feeds to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Convert ANC tokens to USD value in real-time</li>
          <li>Calculate storage costs based on current AR token prices</li>
          <li>Determine LINK token costs for oracle operations</li>
        </ul>
        <p>
          All contracts are deployed and verified on the Polygon Amoy testnet, providing a transparent
          and decentralized way to handle on-chain finance operations for the platform.
        </p>
      </div>
    </div>
  );
}
