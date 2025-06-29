"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { useBalance } from '@/contexts/BalanceContext';
import WalletConnectButton from './WalletConnectButton';
import { DropdownMenuNav } from './ui/dropdown-menu';
import { Home, LayoutDashboard, Upload, Users, ShieldCheck, Clock, Link2, HardDrive } from 'lucide-react';

const Header = () => {
  const pathname = usePathname();
  const { balance, isInitialized } = useBalance();

  const isActive = (path: string) => {
    return pathname === path ? 'text-primary font-medium' : 'text-gray-600 hover:text-primary transition-colors';
  };

  // Navigation items grouped logically
  const navItems = {
    core: {
      label: 'Core',
      items: [
        { label: 'Home', href: '/', icon: Home },
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      ],
    },
    genealogy: {
      label: 'Genealogy',
      items: [
        { label: 'Family Tree', href: '/genealogy', icon: Users },
        { label: 'Upload', href: '/upload', icon: Upload },
      ],
    },
    blockchain: {
      label: 'Blockchain',
      items: [
        { label: 'Explorer', href: '/blockchain', icon: Link2 },
        { label: 'Storage', href: '/storage', icon: HardDrive },
        { label: 'Verification', href: '/verification', icon: ShieldCheck },
      ],
    },
    timecapsule: {
      label: 'Timecapsule',
      href: '/timecapsule',
      icon: Clock,
    },
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-3 md:mb-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">AncestryChain</span>
            </Link>
          </div>
          
          <nav className="flex items-center space-x-1 mb-3 md:mb-0 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {/* Core Dropdown */}
            <DropdownMenuNav 
              trigger={
                <span className="flex items-center">
                  <Home className="h-4 w-4 mr-1" />
                  Core
                </span>
              } 
              items={navItems.core.items}
            />

            {/* Genealogy Dropdown */}
            <DropdownMenuNav 
              trigger={
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Genealogy
                </span>
              } 
              items={navItems.genealogy.items}
            />

            {/* Blockchain Dropdown */}
            <DropdownMenuNav 
              trigger={
                <span className="flex items-center">
                  <Link2 className="h-4 w-4 mr-1" />
                  Blockchain
                </span>
              } 
              items={navItems.blockchain.items}
            />

            {/* Timecapsule (direct link) */}
            <Link 
              href={navItems.timecapsule.href} 
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${isActive(navItems.timecapsule.href)}`}
            >
              <Clock className="h-4 w-4 mr-1" />
              Timecapsule
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {isInitialized && (
              <div className="hidden md:block bg-primary/5 px-3 py-1.5 rounded-md">
                <span className="text-sm font-medium text-primary">{balance.toFixed(2)} ANC</span>
              </div>
            )}
            <WalletConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
