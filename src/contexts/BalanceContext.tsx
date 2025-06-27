"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Context value shape
interface BalanceContextType {
  balance: number;
  adjustBalance: (delta: number) => void;
  setBalance: (newBalance: number) => void;
  isInitialized: boolean;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const BalanceProvider = ({ children }: { children: ReactNode }) => {
  const [balance, setBalance] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize balance from localStorage on client side
  useEffect(() => {
    const stored = localStorage.getItem('anc_balance');
    const initialBalance = stored !== null ? parseFloat(stored) : 100; // 100 ANC tokens by default
    setBalance(initialBalance);
    setIsInitialized(true);
  }, []);

  // Persist balance changes to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('anc_balance', balance.toString());
    }
  }, [balance, isInitialized]);

  const adjustBalance = (delta: number) => {
    setBalance(prev => Math.max(prev + delta, 0));
  };

  return (
    <BalanceContext.Provider value={{ balance, adjustBalance, setBalance, isInitialized }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
};
