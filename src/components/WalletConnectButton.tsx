'use client';

import { useEffect, useState } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';

const WalletConnectButton = () => {
  const { isConnected, account, connectWallet, disconnectWallet } = useWeb3();
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (!isMounted) {
    return (
      <button 
        className="bg-primary/80 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed"
        disabled
      >
        Loading...
      </button>
    );
  }

  if (isConnected && account) {
    return (
      <div className="flex items-center space-x-2">
        <div className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg">
          {formatAddress(account)}
        </div>
        <button
          onClick={disconnectWallet}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 28 25"
        fill="none"
      >
        <path
          d="M24.9415 0.5L13.5179 8.82759L14.8184 4.27586L24.9415 0.5Z"
          fill="#E17726"
          stroke="#E17726"
          strokeWidth="0.5"
        />
        <path
          d="M3.05859 0.5L14.3633 8.87931L13.1816 4.27586L3.05859 0.5ZM20.9949 17.8793L18.0781 21.9655L23.8491 23.5345L25.3302 17.9655L20.9949 17.8793ZM2.66992 17.9655L4.15092 23.5345L9.92192 21.9655L6.96359 17.8793L2.66992 17.9655Z"
          fill="#E27625"
          stroke="#E27625"
          strokeWidth="0.5"
        />
        <path
          d="M9.05859 10.6724L7.02197 13.7414L14.021 14.0862L13.8086 6.5L9.05859 10.6724ZM18.9414 10.6724L14.1289 6.5L14.021 14.0862L20.98 13.7414L18.9414 10.6724ZM9.92188 21.9655L13.1819 20.0862L10.3802 17.9655L9.92188 21.9655ZM14.8181 20.0862L18.0781 21.9655L17.5781 17.9655L14.8181 20.0862Z"
          fill="#E27625"
          stroke="#E27625"
          strokeWidth="0.5"
        />
        <path
          d="M18.0781 21.9655L14.8181 20.0862L17.0602 18.5L18.0781 21.9655ZM10.3802 17.9655L13.1819 20.0862L9.92188 21.9655L10.3802 17.9655Z"
          fill="#D5BFB2"
          stroke="#D5BFB2"
          strokeWidth="0.5"
        />
        <path
          d="M14.0414 15.8793L11.2988 15.1207L13.1814 16.0862L14.0414 15.8793Z"
          fill="#233447"
          stroke="#233447"
          strokeWidth="0.5"
        />
        <path
          d="M13.9586 15.8793L14.8186 16.0862L16.7012 15.1207L13.9586 15.8793Z"
          fill="#233447"
          stroke="#233447"
          strokeWidth="0.5"
        />
        <path
          d="M9.92188 21.9655L10.4219 17.8793L6.96359 17.9655L9.92188 21.9655ZM17.5781 17.8793L18.0781 21.9655L20.9949 17.9655L17.5781 17.8793ZM20.98 13.7414L14.021 14.0862L14.0414 15.8793L14.9 16.0862L16.7826 15.1207L20.4219 13.8793L20.98 13.7414ZM7.02197 13.7414L10.7012 15.1207L12.5838 16.0862L13.4428 15.8793L13.5219 14.0862L6.52197 13.8793L7.02197 13.7414Z"
          fill="#CC6228"
          stroke="#CC6228"
          strokeWidth="0.5"
        />
        <path
          d="M6.52197 13.8793L10.3802 17.9655L7.02197 13.7414L6.52197 13.8793ZM20.4219 13.8793L17.5781 17.8793L20.98 13.7414L20.4219 13.8793ZM13.5219 14.0862L13.4428 15.8793L14.0414 16.0862L14.9 15.8793L14.8186 14.0862H13.5219ZM9.92188 21.9655L10.3802 17.9655L9.05859 17.8793L9.92188 21.9655ZM17.5781 17.9655L18.0781 21.9655L19.4 17.8793L17.5781 17.9655Z"
          fill="#E27525"
          stroke="#E27525"
          strokeWidth="0.5"
        />
        <path
          d="M14.9 15.8793L14.0414 16.0862L14.5 17.8793L14.58 19.5L16.5 15.1207L14.9 15.8793Z"
          fill="#F5841F"
          stroke="#F5841F"
          strokeWidth="0.5"
        />
        <path
          d="M14.9 15.8793L13.1 15.1207L11.42 19.5L11.5 17.8793L12.5838 16.0862L14.9 15.8793Z"
          fill="#F5841F"
          stroke="#F5841F"
          strokeWidth="0.5"
        />
        <path
          d="M14.8186 14.0862L14.9 15.8793L13.1 15.1207L14.8186 14.0862Z"
          fill="#763E1A"
          stroke="#763E1A"
          strokeWidth="0.5"
        />
        <path
          d="M14.0414 16.0862L13.1 15.1207L14.9 15.8793L14.0414 16.0862Z"
          fill="#763E1A"
          stroke="#763E1A"
          strokeWidth="0.5"
        />
      </svg>
      <span>Connect Wallet</span>
    </button>
  );
};

export default WalletConnectButton;
