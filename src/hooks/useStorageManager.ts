import { useCallback, useEffect, useState } from 'react';
import { 
  ethers, 
  BrowserProvider, 
  Signer, 
  Contract, 
  ContractTransaction, 
  ContractTransactionResponse,
  ContractTransactionReceipt,
  Eip1193Provider,
  JsonRpcSigner
} from 'ethers';
import StorageManagerABI from '../contracts/abis/StorageManager.json';
import { CONTRACT_ADDRESSES, DEFAULT_CHAIN_ID } from '../contracts/contracts';

// Extend Window interface to include ethereum
interface EthereumProvider extends Eip1193Provider {
  isMetaMask?: boolean;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export interface StorageManagerStats {
  totalPaidForFile: string;
  userPaidForFile: string;
  totalANCSpent: string;
  ancTokenAddress?: string;
}

export interface AutoBurnParams {
  burnAmount: string;
  burnInterval: number;
  lastBurn: Date;
}

export interface StorageManagerHook {
  payForFileStorage: (fileHash: string, amount: string) => Promise<ethers.ContractTransaction | undefined>;
  getStats: (fileHash: string, userAddress: string) => Promise<StorageManagerStats>;
  getAutoBurnParams: () => Promise<AutoBurnParams>;
  loading: boolean;
  error: string | null;
  contractAddress?: string;
  ancTokenAddress?: string;
}

export function useStorageManager(): StorageManagerHook {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [ancToken, setAncToken] = useState<Contract | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);

  // Initialize provider and signer
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('Ethereum provider not found. Please install MetaMask.');
      return;
    }
    
    const init = async () => {
      try {
        // Create provider and signer
        const provider = new BrowserProvider(window.ethereum);
        
        // Request account access if needed
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Get the signer
        const web3Signer = await provider.getSigner();
        setSigner(web3Signer);
        
        // Check chain ID
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const targetChainId = `0x${DEFAULT_CHAIN_ID.toString(16)}`;
        
        if (chainId !== targetChainId) {
          setError(`Please switch to Polygon Amoy Testnet (Chain ID: ${DEFAULT_CHAIN_ID})`);
          return;
        }
        
        // Set up contract instances
        const storageManagerAddress = CONTRACT_ADDRESSES.StorageManager[DEFAULT_CHAIN_ID];
        const ancTokenAddress = CONTRACT_ADDRESSES.ANCToken[DEFAULT_CHAIN_ID];
        
        const storageManager = new Contract(
          storageManagerAddress,
          StorageManagerABI.abi,
          web3Signer
        );
        
        // Standard ERC20 ABI for basic token interactions
        const erc20Abi = [
          'function balanceOf(address owner) view returns (uint256)',
          'function allowance(address owner, address spender) view returns (uint256)',
          'function approve(address spender, uint256 amount) returns (bool)'
        ];
        
        const ancToken = new Contract(ancTokenAddress, erc20Abi, web3Signer);
        
        setContract(storageManager);
        setAncToken(ancToken);
        setError(null);
      } catch (e: any) {
        console.error('Failed to initialize contracts:', e);
        setError(`Failed to connect to contracts: ${e.message}`);
      }
    };
    
    init();
    
    // Handle account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        // Re-initialize with new account
        init();
      } else {
        setError('Please connect your wallet');
      }
    };
    
    // Handle chain changes
    const handleChainChanged = (chainId: string) => {
      window.location.reload();
    };
    
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // Check if user has approved sufficient allowance
  const checkAndApprove = useCallback(async (spender: string, amount: string) => {
    if (!ancToken || !signer) {
      throw new Error('Contract or signer not initialized');
    }
    
    const address = await signer.getAddress();
    const allowance = await ancToken.allowance(address, spender);
    const amountBN = ethers.parseUnits(amount, 18); // Assuming 18 decimals for ANC
    
    if (allowance < amountBN) {
      const tx = await ancToken.approve(spender, amountBN);
      await tx.wait();
    }
  }, [ancToken, signer]);

  // Pay for file storage (burn ANC, track stats)
  const payForFileStorage = useCallback(
    async (fileHash: string, amount: string): Promise<ContractTransaction | undefined> => {
      if (!contract || !ancToken) {
        throw new Error('Contract not initialized');
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const contractAddress = await contract.getAddress();
        
        // First check and approve if needed
        await checkAndApprove(contractAddress, amount);
        
        // Then call the payForStorage function
        const tx = await contract.payForStorage(
          ethers.keccak256(ethers.toUtf8Bytes(fileHash)),
          ethers.parseUnits(amount, 18) // Convert to wei
        ) as ContractTransactionResponse;
        
        // Return the transaction response which includes the hash
        return tx;
      } catch (err: any) {
        setError(err.message || 'Failed to pay for file storage');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [contract, ancToken, checkAndApprove]
  );

  // Get storage payment statistics
  const getStats = useCallback(
    async (fileHash: string, userAddress: string): Promise<StorageManagerStats> => {
      if (!contract) {
        throw new Error('StorageManager contract not initialized');
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const fileHashBytes = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(fileHash));
        
        const [totalPaid, userPaid, totalSpent, ancTokenAddress] = await Promise.all([
          contract.totalPaidANC(fileHashBytes),
          contract.userPaidANC(userAddress, fileHashBytes),
          contract.totalSpent(),
          contract.ancToken()
        ]);
        
        return {
          totalPaidForFile: ethers.formatEther(totalPaid),
          userPaidForFile: ethers.formatEther(userPaid),
          totalANCSpent: ethers.formatEther(totalSpent),
          ancTokenAddress
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

  // Get auto-burn parameters
  const getAutoBurnParams = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');
    
    setLoading(true);
    setError(null);
    
    try {
      const [burnAmount, burnInterval, lastBurn] = await Promise.all([
        contract.burnAmount() as Promise<bigint>,
        contract.burnInterval() as Promise<bigint>,
        contract.lastBurn() as Promise<bigint>
      ]);
      
      return {
        burnAmount: ethers.formatEther(burnAmount),
        burnInterval: Number(burnInterval),
        lastBurn: new Date(Number(lastBurn) * 1000)
      };
    } catch (err: any) {
      console.error('Error getting auto-burn params:', err);
      setError('Failed to fetch auto-burn parameters');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  return {
    payForFileStorage,
    getStats,
    getAutoBurnParams,
    loading,
    error,
    contractAddress: contract?.target as string | undefined,
    ancTokenAddress: ancToken?.target as string | undefined
  };
}
