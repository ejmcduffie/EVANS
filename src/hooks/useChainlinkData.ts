"use client";

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import TreasuryRouterABI from '../contracts/abis/TreasuryRouter.json';

// Contract addresses from deployment
const TREASURY_ROUTER_ADDRESS = '0xDC8B87F6C743cFE74d3074E75F600eCaB614bcE5';
const MOCK_AR_ADDRESS = '0xc748E2F94ff95Fec69A5aC54A60349609bEE8b99';

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
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
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
        // Check if window is defined (browser environment)
        if (typeof window !== 'undefined' && window.ethereum) {
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(browserProvider);
          
          const treasuryContract = new ethers.Contract(
            TREASURY_ROUTER_ADDRESS,
            TreasuryRouterABI,
            browserProvider
          );
          setContract(treasuryContract);
          
          try {
            const signerInstance = await browserProvider.getSigner();
            setSigner(signerInstance);
          } catch (err) {
            console.log("No signer available yet, read-only mode");
          }
        } else {
          setError("Ethereum provider not found. Please install MetaMask.");
        }
      } catch (err) {
        console.error("Failed to initialize provider:", err);
        setError("Failed to connect to blockchain");
      }
    };

    init();
  }, []);

  // Fetch price data from the contract
  const fetchPriceData = useCallback(async () => {
    if (!contract) return;
    
    try {
      setIsLoading(true);
      
      // Get price data from Chainlink feeds
      const [ancPriceRaw, arPriceRaw, linkPriceRaw] = await Promise.all([
        contract.getAncUsdPrice(),
        contract.getArUsdPrice(),
        contract.getLinkUsdPrice()
      ]);
      
      // Convert to human-readable numbers (assuming 8 decimals for Chainlink feeds)
      const ancPriceNum = parseFloat(ethers.formatUnits(ancPriceRaw, 8));
      const arPriceNum = parseFloat(ethers.formatUnits(arPriceRaw, 8));
      const linkPriceNum = parseFloat(ethers.formatUnits(linkPriceRaw, 8));
      
      setAncPrice(ancPriceNum);
      setArPrice(arPriceNum);
      setLinkPrice(linkPriceNum);
      
      // Calculate USD value of ANC balance
      setAncUsdBalance(ancBalance * ancPriceNum);
      
      setError(null);
    } catch (err) {
      console.error("Error fetching price data:", err);
      setError("Failed to fetch price data");
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
      const tx = await contractWithSigner.purchaseStorage(gbAmount);
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
