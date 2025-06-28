import ArweaveTest from '@/components/ArweaveTest';

export default function ArweaveTestPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Arweave Integration Test</h1>
        <ArweaveTest />
      </div>
    </main>
  );
}
