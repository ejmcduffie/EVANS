"use client";

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import TreasuryRouterABI from '../contracts/abis/TreasuryRouter.json';

// Add ethereum to the window type
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Contract addresses from deployment
const TREASURY_ROUTER_ADDRESS = '0xDC8B87F6C743cFE74d3074E75F600eCaB614bcE5';
const MOCK_AR_ADDRESS = '0xc748E2F94ff95Fec69A5aC54A60349609bEE8b99';

// Fallback RPC URL from environment variables or hardcoded value
const FALLBACK_RPC_URL = process.env.NEXT_PUBLIC_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';

// Interface for the hook return value
interface ChainlinkData {
  ancPrice: number;
  arPrice: number;
  linkPrice: number;
  ancUsdBalance: number;
  isLoading: boolean;
  error: string | null;
  calculateStorageCost: (gbAmount: number) => Promise<number>;
  purchaseStorage: (gbAmount: number) => Promise<boolean>;
}

export const useChainlinkData = (ancBalance: number): ChainlinkData => {
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  
  const [ancPrice, setAncPrice] = useState<number>(0);
  const [arPrice, setArPrice] = useState<number>(0);
  const [linkPrice, setLinkPrice] = useState<number>(0);
  const [ancUsdBalance, setAncUsdBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize provider and contract
  useEffect(() => {
    const init = async () => {
      try {
        let provider;
        let contractInstance;
        
        // First try to use MetaMask if available
        if (typeof window !== 'undefined' && window.ethereum) {
          try {
            // Request account access if needed
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            provider = new ethers.BrowserProvider(window.ethereum);
            console.log("Connected to MetaMask");
          } catch (metamaskError) {
            console.warn("MetaMask connection failed:", metamaskError);
            // Fall back to RPC URL
            provider = new ethers.JsonRpcProvider(FALLBACK_RPC_URL);
            console.log("Falling back to RPC URL");
          }
        } else {
          // No MetaMask, use RPC URL
          provider = new ethers.JsonRpcProvider(FALLBACK_RPC_URL);
          console.log("Using RPC URL (no MetaMask detected)");
        }
        
        setProvider(provider);
        
        // Create contract instance
        contractInstance = new ethers.Contract(
          TREASURY_ROUTER_ADDRESS,
          TreasuryRouterABI,
          provider
        );
        setContract(contractInstance);
        
        // Try to get signer if using browser provider
        if (provider instanceof ethers.BrowserProvider) {
          try {
            const signerInstance = await provider.getSigner();
            setSigner(signerInstance);
            console.log("Signer obtained");
          } catch (signerError) {
            console.log("No signer available, using read-only mode", signerError);
          }
        }
        
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error("Failed to initialize provider:", err);
        setError("Failed to connect to blockchain: " + (err instanceof Error ? err.message : String(err)));
      }
    };

    init();
  }, []);

  // Fetch price data from the contract
  const fetchPriceData = useCallback(async () => {
    if (!contract) return;
    
    try {
      setIsLoading(true);
      console.log("Fetching price data from contract...");
      
      // Get price data from Chainlink feeds one by one with better error handling
      try {
        const ancPriceRaw = await contract.getAncUsdPrice();
        const ancPriceNum = parseFloat(ethers.formatUnits(ancPriceRaw, 8));
        setAncPrice(ancPriceNum);
        console.log("ANC price fetched:", ancPriceNum);
        
        // Calculate USD value of ANC balance
        setAncUsdBalance(ancBalance * ancPriceNum);
      } catch (ancError) {
        console.error("Error fetching ANC price:", ancError);
        setError("Failed to fetch ANC price");
      }
      
      try {
        const arPriceRaw = await contract.getArUsdPrice();
        const arPriceNum = parseFloat(ethers.formatUnits(arPriceRaw, 8));
        setArPrice(arPriceNum);
        console.log("AR price fetched:", arPriceNum);
      } catch (arError) {
        console.error("Error fetching AR price:", arError);
        setError("Failed to fetch AR price");
      }
      
      try {
        const linkPriceRaw = await contract.getLinkUsdPrice();
        const linkPriceNum = parseFloat(ethers.formatUnits(linkPriceRaw, 8));
        setLinkPrice(linkPriceNum);
        console.log("LINK price fetched:", linkPriceNum);
      } catch (linkError) {
        console.error("Error fetching LINK price:", linkError);
        setError("Failed to fetch LINK price");
      }
      
    } catch (err) {
      console.error("Error in fetchPriceData:", err);
      setError("Failed to fetch price data: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [contract, ancBalance]);

  // Fetch data when contract is available or ancBalance changes
  useEffect(() => {
    if (contract) {
      fetchPriceData();
    }
  }, [contract, ancBalance, fetchPriceData]);

  // Calculate storage cost in ANC tokens
  const calculateStorageCost = useCallback(async (gbAmount: number): Promise<number> => {
    if (!contract) return 0;
    
    try {
      const cost = await contract.calculateAncCostForStorage(gbAmount);
      return parseFloat(ethers.formatUnits(cost, 18)); // Assuming ANC has 18 decimals
    } catch (err) {
      console.error("Error calculating storage cost:", err);
      setError("Failed to calculate storage cost");
      return 0;
    }
  }, [contract]);

  // Purchase storage with ANC tokens
  const purchaseStorage = useCallback(async (gbAmount: number): Promise<boolean> => {
    if (!contract || !signer) {
      setError("Wallet not connected");
      return false;
    }
    
    try {
      const contractWithSigner = contract.connect(signer);
      // Use type assertion to tell TypeScript that this method exists
      const tx = await (contractWithSigner as any).purchaseStorage(gbAmount);
      await tx.wait();
      return true;
    } catch (err) {
      console.error("Error purchasing storage:", err);
      setError("Failed to purchase storage");
      return false;
    }
  }, [contract, signer]);

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
