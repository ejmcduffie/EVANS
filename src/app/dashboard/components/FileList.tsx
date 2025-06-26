import React, { useState } from 'react';
import Link from 'next/link';

type FileType = {
  id: string;
  name: string;
  fileCategory: string;
  status: string;
  size: number;
  createdAt: Date;
};

type FileListProps = {
  files: FileType[];
  formatFileSize: (sizeInBytes: number) => string;
  formatDate: (date: Date) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
  mintNFT: (fileId: string) => void;
  downloadFile: (fileId: string) => void;
  deleteFile: (fileId: string) => void;
  isProcessingMint: string | null;
  onSelectionChange?: (selectedFileIds: string[]) => void;
  writeToBlockchain?: () => void;
};

export default function FileList({
  files,
  formatFileSize,
  formatDate,
  getStatusColor,
  getStatusIcon,
  mintNFT,
  downloadFile,
  deleteFile,
  isProcessingMint,
  onSelectionChange,
  writeToBlockchain
}: FileListProps) {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  
  const handleSelectFile = (fileId: string, isChecked: boolean) => {
    let newSelectedFiles: string[];
    
    if (isChecked) {
      newSelectedFiles = [...selectedFiles, fileId];
    } else {
      newSelectedFiles = selectedFiles.filter(id => id !== fileId);
    }
    
    setSelectedFiles(newSelectedFiles);
    onSelectionChange && onSelectionChange(newSelectedFiles);
  };
  
  const handleSelectAll = (isChecked: boolean) => {
    const newSelectedFiles = isChecked ? files.map(file => file.id) : [];
    setSelectedFiles(newSelectedFiles);
    onSelectionChange && onSelectionChange(newSelectedFiles);
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Your Files</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search files..."
            className="border rounded px-3 py-1 text-sm"
          />
          <select className="border rounded px-3 py-1 text-sm">
            <option>All Status</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>Verified</option>
            <option>NFT_Minted</option>
          </select>
          <select className="border rounded px-3 py-1 text-sm">
            <option>All Categories</option>
            <option>GEDCOM</option>
            <option>Image</option>
            <option>Document</option>
          </select>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mb-4 flex justify-between items-center">
          <div>
            <span className="text-sm font-medium">{selectedFiles.length} files selected</span>
          </div>
          <div>
            <button 
              className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-dark transition-colors"
              onClick={writeToBlockchain}
            >
              Write to Blockchain
            </button>
            <button 
              className="ml-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              onClick={() => {
                setSelectedFiles([]);
                onSelectionChange && onSelectionChange([]);
              }}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-primary transition duration-150 ease-in-out"
                  checked={selectedFiles.length === files.length && files.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {files.map((file) => (
              <tr key={file.id}>
                <td className="px-4 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary transition duration-150 ease-in-out"
                    checked={selectedFiles.includes(file.id)}
                    onChange={(e) => handleSelectFile(file.id, e.target.checked)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{file.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{file.fileCategory}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatFileSize(file.size)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(file.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(file.status)}`}>
                    {getStatusIcon(file.status)} {file.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-3">
                    {file.status === 'Verified' && (
                      <button
                        onClick={() => mintNFT(file.id)}
                        className="text-primary hover:text-primary-dark disabled:opacity-50"
                        disabled={isProcessingMint === file.id}
                        title="Mint NFT"
                      >
                        {isProcessingMint === file.id ? 'Minting...' : 'Mint NFT'}
                      </button>
                    )}
                    <button
                      onClick={() => downloadFile(file.id)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Download file"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteFile(file.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete file"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to <span className="font-medium">{files.length}</span> of{' '}
          <span className="font-medium">{files.length}</span> files
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border rounded text-sm">Previous</button>
          <button className="px-3 py-1 border rounded text-sm">Next</button>
        </div>
      </div>
    </div>
  );
}
