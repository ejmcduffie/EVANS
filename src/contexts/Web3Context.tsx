'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';

type Web3ContextType = {
  isConnected: boolean;
  account: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  provider: ethers.BrowserProvider | null;
};

const Web3Context = createContext<Web3ContextType>({
  isConnected: false,
  account: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  provider: null,
});

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  // Check if wallet is connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          setAccount(accounts[0].address);
          setIsConnected(true);
          setProvider(provider);
        }
      }
    };

    checkConnection();
  }, []);

  // Handle account and chain changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const ethereum = window.ethereum;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // Disconnected
        setIsConnected(false);
        setAccount(null);
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      window.open('https://metamask.io/download.html', '_blank');
      return;
    }

    try {
      const ethereum = window.ethereum;
      const provider = new ethers.BrowserProvider(ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setAccount(address);
      setIsConnected(true);
      setProvider(provider);
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount(null);
    setProvider(null);
  };

  return (
    <Web3Context.Provider
      value={{
        isConnected,
        account,
        connectWallet,
        disconnectWallet,
        provider,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
