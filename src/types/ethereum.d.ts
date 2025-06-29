import { MetaMaskInpageProvider } from '@metamask/providers';

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider & {
      isMetaMask?: boolean;
      request: (request: { method: string; params?: any[] }) => Promise<any>;
      on: (eventName: string, callback: (args: any) => void) => void;
      removeListener: (eventName: string, callback: (args: any) => void) => void;
    };
  }
}

export {};
