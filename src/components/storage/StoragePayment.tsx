'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useStorageManager } from '@/hooks/useStorageManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function StoragePayment() {
  const [fileHash, setFileHash] = useState('');
  const [amount, setAmount] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [stats, setStats] = useState<{
    totalPaidForFile: string;
    userPaidForFile: string;
    totalANCSpent: string;
    ancTokenAddress?: string;
  } | null>(null);
  const [autoBurnParams, setAutoBurnParams] = useState<{
    burnAmount: string;
    burnInterval: number;
    lastBurn: Date;
  } | null>(null);
  const [txHash, setTxHash] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // Initialize the hook
  const { 
    payForFileStorage, 
    getStats, 
    getAutoBurnParams,
    loading, 
    error,
    contractAddress,
    ancTokenAddress
  } = useStorageManager();
  
  // Track user address
  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setUserAddress(address);
        } catch (err) {
          console.error('Failed to connect to wallet:', err);
        }
      }
    };
    
    init();
    
    // Handle account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setUserAddress(accounts[0]);
      } else {
        setUserAddress('');
      }
    };
    
    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    
    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);
  
  // Load stats when file hash or user address changes
  useEffect(() => {
    const loadData = async () => {
      if (!fileHash || !userAddress) return;
      
      try {
        // Load stats
        const statsData = await getStats(fileHash, userAddress);
        setStats(statsData);
        
        // Load auto-burn params
        const burnParams = await getAutoBurnParams();
        setAutoBurnParams(burnParams);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };
    
    loadData();
  }, [fileHash, userAddress, getStats, getAutoBurnParams]);
  
  const handlePayForStorage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileHash || !amount) return;
    
    try {
      const tx = await payForFileStorage(fileHash, amount);
      if (tx) {
        setTxHash(tx.hash);
        
        // Wait for transaction to be mined
        const receipt = await tx.wait();
        if (receipt) {
          // Refresh stats after successful payment
          if (userAddress) {
            const updatedStats = await getStats(fileHash, userAddress);
            setStats(updatedStats);
          }
        }
      }
    } catch (err) {
      console.error('Payment failed:', err);
    }
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };
  
  // Handle server-side rendering
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pay for File Storage</CardTitle>
          <CardDescription>
            Pay ANC tokens to store your file permanently on the blockchain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!userAddress ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Wallet not connected</AlertTitle>
              <AlertDescription>
                Please connect your wallet to interact with the StorageManager contract.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handlePayForStorage} className="space-y-4">
              <div>
                <label htmlFor="fileHash" className="block text-sm font-medium mb-1">
                  File Hash
                </label>
                <Input
                  id="fileHash"
                  type="text"
                  placeholder="Enter file hash"
                  value={fileHash}
                  onChange={(e) => setFileHash(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="amount" className="block text-sm font-medium mb-1">
                  Amount (ANC)
                </label>
                <Input
                  id="amount"
                  type="number"
                  step="0.000000000000000001"
                  placeholder="Enter amount in ANC"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Pay for Storage'
                )}
              </Button>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {txHash && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertTitle>Transaction sent!</AlertTitle>
                  <AlertDescription>
                    View on explorer: <a 
                      href={`https://amoy.polygonscan.com/tx/${txHash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline hover:no-underline"
                    >
                      {txHash.slice(0, 10)}...{txHash.slice(-8)}
                    </a>
                  </AlertDescription>
                </Alert>
              )}
            </form>
          )}
        </CardContent>
      </Card>
      
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Storage Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Paid for File</p>
                <p className="font-medium">{stats.totalPaidForFile} ANC</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">You Paid for File</p>
                <p className="font-medium">{stats.userPaidForFile} ANC</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total ANC Spent</p>
                <p className="font-medium">{stats.totalANCSpent} ANC</p>
              </div>
              {stats.ancTokenAddress && (
                <div>
                  <p className="text-sm text-muted-foreground">ANC Token</p>
                  <a 
                    href={`https://amoy.polygonscan.com/address/${stats.ancTokenAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-sm"
                  >
                    View on Explorer
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {autoBurnParams && (
        <Card>
          <CardHeader>
            <CardTitle>Auto-Burn Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Burn Amount</p>
                <p className="font-medium">{autoBurnParams.burnAmount} ANC</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Burn Interval</p>
                <p className="font-medium">
                  {autoBurnParams.burnInterval / 86400} days
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Burn</p>
                <p className="font-medium">
                  {formatDate(autoBurnParams.lastBurn)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="text-xs text-muted-foreground">
        <p>StorageManager Contract: {contractAddress ? (
          <a 
            href={`https://amoy.polygonscan.com/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}
          </a>
        ) : 'Loading...'}</p>
      </div>
    </div>
  );
}
