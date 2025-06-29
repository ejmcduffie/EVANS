'use client';

import { StoragePayment } from '@/components/storage/StoragePayment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function StoragePage() {
  return (
    <div className="container mx-auto py-8 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">File Storage Payment</h1>
        <p className="text-muted-foreground mb-8">
          Pay ANC tokens to store your file hashes on the blockchain. Each payment contributes to the permanent
          storage of your data and helps secure the network.
        </p>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              Pay ANC tokens to store your file hashes permanently on the blockchain.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">1. Connect Your Wallet</h3>
              <p className="text-sm text-muted-foreground">
                Connect your wallet to the Polygon Amoy testnet to interact with the StorageManager contract.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">2. Enter File Hash</h3>
              <p className="text-sm text-muted-foreground">
                Enter the hash of the file you want to store. This should be a unique identifier for your file.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">3. Pay with ANC Tokens</h3>
              <p className="text-sm text-muted-foreground">
                Specify the amount of ANC tokens to pay for storage. The more you pay, the more you contribute to the network.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <StoragePayment />
      </div>
    </div>
  );
}
