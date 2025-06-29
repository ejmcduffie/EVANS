'use client';

import { BalanceProvider } from '@/contexts/BalanceContext';
import { Web3Provider } from '@/contexts/Web3Context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Web3Provider>
      <BalanceProvider>
        {children}
      </BalanceProvider>
    </Web3Provider>
  );
}
