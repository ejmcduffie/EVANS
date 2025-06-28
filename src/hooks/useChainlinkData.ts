"use client";

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import TreasuryRouterABI from '../contracts/abis/TreasuryRouter.json';

// Environment variables
const FALLBACK_RPC_URL = process.env.NEXT_PUBLIC_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';
const TREASURY_ROUTER_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ROUTER_ADDRESS || '';

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (request: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

// Type for the Treasury Router ABI
type TreasuryRouterABI = Array<{
  inputs: Array<{ internalType: string; name: string; type: string }>;
  name: string;
  outputs: Array<{ internalType: string; name: string; type: string }>;
  stateMutability: string;
  type: string;
}>;

interface ChainlinkData {
  ancPrice: string;
  arPrice: string;
  linkPrice: string;
  ancUsdBalance: string;
  isLoading: boolean;
  error: string | null;
  calculateStorageCost: (gb: number) => Promise<string>;
  purchaseStorage: (gb: number) => Promise<void>;
}

const useChainlinkData = (ancBalance: number): ChainlinkData => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | ethers.JsonRpcProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [ancPrice, setAncPrice] = useState<string>('0');
  const [arPrice, setArPrice] = useState<string>('0');
  const [linkPrice, setLinkPrice] = useState<string>('0');
  const [ancUsdBalance, setAncUsdBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize provider and contract
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use browser provider if available, otherwise fallback to JSON RPC
        let provider: ethers.BrowserProvider | ethers.JsonRpcProvider;
        if (typeof window !== 'undefined' && window.ethereum) {
          provider = new ethers.BrowserProvider(window.ethereum);
          // Try to get signer
          try {
            const signer = await provider.getSigner();
            setSigner(signer);
          } catch (err) {
            console.warn('Could not get signer, using read-only mode');
          }
        } else {
          provider = new ethers.JsonRpcProvider(FALLBACK_RPC_URL);
        }
        
        setProvider(provider);
        
        // Create contract instance
        const contract = new ethers.Contract(
          TREASURY_ROUTER_ADDRESS,
          TreasuryRouterABI as any, // Type assertion since ABI might be more specific
          provider
        );
        
        setContract(contract);
        
        // Initial price fetch
        await fetchPriceData(contract);
        
      } catch (err) {
        console.error('Failed to initialize provider/contract:', err);
        setError('Failed to connect to the blockchain. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
    
    // Set up polling for price updates
    const intervalId = setInterval(() => {
      if (contract) {
        fetchPriceData(contract);
      }
    }, 60000); // Update every minute
    
    return () => clearInterval(intervalId);
  }, []);

  // Fetch price data from the contract
  const fetchPriceData = async (contractInstance: ethers.Contract) => {
    if (!contractInstance) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch all prices in parallel
      const [ancPrice, arPrice, linkPrice] = await Promise.all([
        contractInstance.getAncUsdPrice(),
        contractInstance.getArUsdPrice(),
        contractInstance.getLinkUsdPrice()
      ]);
      
      // Update state with formatted prices
      setAncPrice(ethers.formatUnits(ancPrice, 8));
      setArPrice(ethers.formatUnits(arPrice, 8));
      setLinkPrice(ethers.formatUnits(linkPrice, 8));
      
      // Calculate and update ANC balance in USD
      const ancBalanceWei = ethers.parseUnits(ancBalance.toString(), 18);
      const ancPriceBigInt = typeof ancPrice === 'bigint' ? ancPrice : BigInt(ancPrice.toString());
      const ancBalanceUsd = parseFloat(ethers.formatUnits(ancPriceBigInt * ancBalanceWei / ethers.WeiPerEther, 8));
      setAncUsdBalance(ancBalanceUsd.toFixed(2));
      
    } catch (err) {
      console.error('Error fetching price data:', err);
      setError('Failed to fetch price data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize provider and contract
  useEffect(() => {
    const init = async () => {
      try {
        console.log('Initializing provider and contract in read-only mode...');
        const provider = new ethers.JsonRpcProvider(FALLBACK_RPC_URL);
        
        // Log network info
        const network = await provider.getNetwork();
        console.log('Connected to network:', {
          name: network.name,
          chainId: network.chainId,
          isTestnet: network.chainId === 80002n ? 'Amoy Testnet' : 'Other',
          expectedChainId: 80002n
        });
        
        if (network.chainId !== 80002n) {
          console.warn('Warning: Connected to wrong network. Some features may not work.');
        }
        
        // Create contract instance
        const contractInstance = new ethers.Contract(
          TREASURY_ROUTER_ADDRESS,
          TreasuryRouterABI,
          provider
        );
        
        setProvider(provider);
        setContract(contractInstance);
        
        // Initial fetch
        await fetchPriceData();
        
        // Set up timer for periodic price updates
        const interval = setInterval(fetchPriceData, 60000); // Update every minute
        
        return () => clearInterval(interval);
        
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Failed to initialize contract:', {
          error: errorMessage,
          contractAddress: TREASURY_ROUTER_ADDRESS,
          rpcUrl: FALLBACK_RPC_URL
        });
        setError(`Failed to initialize contract: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
  }, [fetchPriceData]);
    
  // Calculate storage cost in ANC
  const calculateStorageCost = useCallback(async (gb: number): Promise<string> => {
    if (!contract) return '0';
    
    try {
      const cost = await contract.calculateAncCostForStorage(gb);
      return ethers.formatUnits(cost, 18);
    } catch (err) {
      console.error('Error calculating storage cost:', err);
      throw new Error('Failed to calculate storage cost');
    }
  }, [contract]);

  // Purchase storage
  const purchaseStorage = useCallback(async (gb: number): Promise<void> => {
    if (!contract || !signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Get the cost in ANC
      const cost = await calculateStorageCost(gb);
      const tx = await contract.connect(signer).purchaseStorage(gb, { 
        value: ethers.parseUnits(cost, 18) 
      });
      
      console.log('Transaction sent:', tx.hash);
      await tx.wait();
      
      // Refresh data after purchase
      if (contract) {
        await fetchPriceData(contract);
      }
      
    } catch (err) {
      console.error('Error purchasing storage:', err);
      setError('Failed to purchase storage. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contract, signer, calculateStorageCost]);
  
  return {
    ancPrice,
    arPrice,
    linkPrice,
    ancUsdBalance,
    isLoading,
    error,
    calculateStorageCost,
    purchaseStorage
  };
};

export default useChainlinkData;