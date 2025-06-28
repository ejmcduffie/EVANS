'use client';

import { useState } from 'react';
import { uploadFileToArweave, uploadJsonToArweave, getFromArweave } from '@/lib/arweave-upload';

export default function ArweaveTest() {
  const [file, setFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState('{"name":"Test Data","value":123}');
  const [transactionId, setTransactionId] = useState('');
  const [status, setStatus] = useState<{
    loading: boolean;
    message: string;
    error?: string;
    url?: string;
  }>({ loading: false, message: '' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadFile = async () => {
    if (!file) {
      setStatus({ loading: false, message: 'No file selected', error: 'Please select a file' });
      return;
    }

    setStatus({ loading: true, message: 'Uploading file to Arweave...' });
    
    try {
      const result = await uploadFileToArweave(file, {
        tags: {
          'App-Name': 'AncestryChain',
          'Content-Type': file.type,
          'File-Name': file.name,
          'Upload-Date': new Date().toISOString()
        }
      });

      if (result.success && result.transactionId) {
        setTransactionId(result.transactionId);
        setStatus({
          loading: false,
          message: 'File uploaded successfully!',
          url: result.url
        });
      } else {
        throw new Error(result.error || 'Unknown error during upload');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setStatus({
        loading: false,
        message: 'Error uploading file',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const handleUploadJson = async () => {
    setStatus({ loading: true, message: 'Uploading JSON to Arweave...' });
    
    try {
      const data = JSON.parse(jsonData);
      const result = await uploadJsonToArweave(data, {
        'App-Name': 'AncestryChain',
        'Content-Type': 'application/json',
        'Upload-Date': new Date().toISOString()
      });

      if (result.success && result.transactionId) {
        setTransactionId(result.transactionId);
        setStatus({
          loading: false,
          message: 'JSON data uploaded successfully!',
          url: result.url
        });
      } else {
        throw new Error(result.error || 'Unknown error during upload');
      }
    } catch (error) {
      console.error('Error uploading JSON:', error);
      setStatus({
        loading: false,
        message: 'Error uploading JSON',
        error: error instanceof Error ? error.message : 'Invalid JSON or upload error'
      });
    }
  };

  const handleRetrieveData = async () => {
    if (!transactionId) {
      setStatus({ loading: false, message: 'No transaction ID', error: 'Please upload a file or JSON first' });
      return;
    }

    setStatus({ loading: true, message: 'Retrieving data from Arweave...' });
    
    try {
      const result = await getFromArweave(transactionId);
      if (result.success) {
        setStatus({
          loading: false,
          message: 'Data retrieved successfully!',
          url: `https://arweave.net/${transactionId}`
        });
        console.log('Retrieved data:', result.data);
      } else {
        throw new Error(result.error || 'Failed to retrieve data');
      }
    } catch (error) {
      console.error('Error retrieving data:', error);
      setStatus({
        loading: false,
        message: 'Error retrieving data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Arweave Integration Test</h2>
      
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold mb-2">Status</h3>
        <div className="text-sm">
          <p className={status.error ? 'text-red-600' : 'text-gray-800'}>
            {status.loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {status.message}
              </span>
            ) : (
              status.message
            )}
            {status.error && (
              <span className="block mt-1 text-red-700 bg-red-100 p-2 rounded">
                Error: {status.error}
              </span>
            )}
            {status.url && (
              <a 
                href={status.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-2 inline-block text-blue-600 hover:underline"
              >
                View on Arweave ↗
              </a>
            )}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="border p-4 rounded">
          <h3 className="text-lg font-medium mb-3">Upload File</h3>
          <div className="flex flex-col space-y-3">
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <button
              onClick={handleUploadFile}
              disabled={!file || status.loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload File to Arweave
            </button>
          </div>
        </div>

        <div className="border p-4 rounded">
          <h3 className="text-lg font-medium mb-3">Upload JSON Data</h3>
          <div className="flex flex-col space-y-3">
            <textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              className="w-full p-2 border rounded h-32 font-mono text-sm"
              placeholder="Enter JSON data..."
            />
            <button
              onClick={handleUploadJson}
              disabled={!jsonData || status.loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload JSON to Arweave
            </button>
          </div>
        </div>

        {transactionId && (
          <div className="border p-4 rounded bg-gray-50">
            <h3 className="text-lg font-medium mb-2">Transaction Info</h3>
            <div className="text-sm mb-3 p-2 bg-white rounded border break-all">
              {transactionId}
            </div>
            <button
              onClick={handleRetrieveData}
              disabled={status.loading}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Retrieve Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
