"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { useBalance } from '@/contexts/BalanceContext';

const Header = () => {
  const pathname = usePathname();
  const { balance, isInitialized } = useBalance();

  const isActive = (path: string) => {
    return pathname === path ? 'nav-link-active' : 'nav-link';
  };

  return (
    <header className="bg-secondary-light shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">AncestryChain</span>
            </Link>
          </div>
          <nav className="flex items-center space-x-6">
            <Link href="/" className={isActive('/')}>Home</Link>
            <Link href="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
            <Link href="/upload" className={isActive('/upload')}>Upload</Link>
            <Link href="/genealogy" className={isActive('/genealogy')}>Family Tree</Link>
            <Link href="/verification" className={isActive('/verification')}>Verification</Link>
            <Link href="/timecapsule" className={isActive('/timecapsule')}>Timecapsule</Link>
            <Link href="/blockchain" className={isActive('/blockchain')}>Blockchain</Link>
            <Link href="/storage" className={isActive('/storage')}>Storage</Link>
            {isInitialized && (
              <span className="font-semibold text-primary">ANC Balance: {balance.toFixed(2)} ANC</span>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
