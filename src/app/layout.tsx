import type { Metadata } from 'next';
import './globals.css';
import { BalanceProvider } from '@/contexts/BalanceContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'AncestryChain | Verify Slave Records Lineage',
  description: 'Verify United States slave records and genealogy with blockchain technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <BalanceProvider>
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
              </BalanceProvider>
      </body>
    </html>
  );
}
