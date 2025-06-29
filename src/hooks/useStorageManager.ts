import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
// Import the ABI and config
import StorageManagerABI from '../contracts/abis/StorageManager.json';

// You should set this to the deployed address of your StorageManager contract
const STORAGE_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_STORAGE_MANAGER_ADDRESS || '';

export interface StorageManagerStats {
  totalPaidForFile: string;
  userPaidForFile: string;
  totalANCSpent: string;
}

export interface StorageManagerHook {
  payForFileStorage: (fileHash: string, amount: string, purpose: string) => Promise<void>;
  getStats: (fileHash: string, userAddress: string) => Promise<StorageManagerStats>;
  loading: boolean;
  error: string | null;
}

export function useStorageManager(signer?: ethers.Signer | null): StorageManagerHook {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (!STORAGE_MANAGER_ADDRESS) {
      setError('StorageManager contract address not set');
      return;
    }
    try {
      const provider = signer ? signer.provider : new ethers.BrowserProvider(window.ethereum);
      const c = new ethers.Contract(STORAGE_MANAGER_ADDRESS, StorageManagerABI.abi, signer || provider);
      setContract(c);
    } catch (e: any) {
      setError('Failed to connect to StorageManager contract');
    }
  }, [signer]);

  // Pay for file storage (burn ANC, track stats)
  const payForFileStorage = useCallback(
    async (fileHash: string, amount: string, purpose: string) => {
      if (!contract) throw new Error('StorageManager contract not initialized');
      setLoading(true);
      setError(null);
      try {
        const tx = await contract.payForFileStorage(fileHash, amount, purpose);
        await tx.wait();
      } catch (err: any) {
        setError(err.message || 'Failed to pay for file storage');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [contract]
  );

  // Get stats for a file and user
  const getStats = useCallback(
    async (fileHash: string, userAddress: string): Promise<StorageManagerStats> => {
      if (!contract) throw new Error('StorageManager contract not initialized');
      setLoading(true);
      setError(null);
      try {
        const [totalPaid, userPaid, totalSpent] = await Promise.all([
          contract.getTotalPaidForFile(fileHash),
          contract.getUserPaidForFile(userAddress, fileHash),
          contract.getTotalANCSpent()
        ]);
        return {
          totalPaidForFile: ethers.formatUnits(totalPaid, 18),
          userPaidForFile: ethers.formatUnits(userPaid, 18),
          totalANCSpent: ethers.formatUnits(totalSpent, 18)
        };
      } catch (err: any) {
        setError(err.message || 'Failed to fetch stats');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [contract]
  );

  return {
    payForFileStorage,
    getStats,
    loading,
    error
  };
}
