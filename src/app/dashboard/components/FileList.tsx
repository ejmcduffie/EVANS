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

// Helper function to get file icon based on category
const getFileIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'gedcom':
      return '📜';
    case 'image':
      return '🖼️';
    case 'document':
      return '📄';
    default:
      return '📁';
  }
};

// Helper function to get category display name
const getCategoryDisplayName = (category: string) => {
  switch (category.toLowerCase()) {
    case 'gedcom':
      return 'Family Tree';
    default:
      return category;
  }
};

// Helper function to get file description
const getFileDescription = (fileName: string) => {
  if (fileName.includes('Stark_FamilyTree')) return 'Complete Stark family lineage with detailed ancestry';
  if (fileName.includes('Eddard_Stark')) return 'Official portrait of Lord Eddard Stark of Winterfell';
  if (fileName.includes('Stark_Lineage')) return 'Detailed lineage report of House Stark';
  if (fileName.includes('Winterfell_Deeds')) return 'Land deeds and property records of Winterfell';
  if (fileName.includes('Jon_Snow')) return 'Birth record of Jon Snow from the Tower of Joy';
  return 'Family record from the archives of Winterfell';
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
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
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
          <div className="relative">
            <input
              type="text"
              placeholder="Search Winterfell archives..."
              className="border border-gray-300 rounded-lg px-4 py-2 pl-10 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <select 
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Verified">Verified</option>
            <option value="NFT_Minted">NFT Minted</option>
          </select>
          <select 
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="GEDCOM">Family Trees</option>
            <option value="Image">Portraits</option>
            <option value="Document">Documents</option>
          </select>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg flex justify-between items-center">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-gray-700">{selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} selected</span>
          </div>
          <div className="space-x-2">
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
              onClick={writeToBlockchain}
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Secure on Blockchain
            </button>
            <button 
              className="ml-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center"
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
      
      <div className="space-y-4">
        {files
          .filter(file => 
            (statusFilter ? file.status === statusFilter : true) && 
            (categoryFilter ? file.fileCategory === categoryFilter : true)
          )
          .map((file) => (
            <div key={file.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">{getFileIcon(file.fileCategory)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                            checked={selectedFiles.includes(file.id)}
                            onChange={(e) => handleSelectFile(file.id, e.target.checked)}
                          />
                          {file.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {getFileDescription(file.name)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(file.status)}`}>
                          {file.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <span className="mr-4">{getCategoryDisplayName(file.fileCategory)}</span>
                      <span className="mr-4">{formatFileSize(file.size)}</span>
                      <span>Uploaded {formatDate(file.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-3 border-t border-gray-100">
                <button
                  onClick={() => mintNFT(file.id)}
                  disabled={isProcessingMint === file.id || file.status === 'NFT_Minted'}
                  className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white ${file.status === 'NFT_Minted' ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50`}
                >
                  {isProcessingMint === file.id ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Minting...
                    </>
                  ) : file.status === 'NFT_Minted' ? (
                    <>
                      <svg className="-ml-0.5 mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      NFT Minted
                    </>
                  ) : (
                    <>
                      <svg className="-ml-0.5 mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                      </svg>
                      Mint as NFT
                    </>
                  )}
                </button>
                <button
                  onClick={() => downloadFile(file.id)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="-ml-0.5 mr-1.5 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={() => deleteFile(file.id)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg className="-ml-0.5 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
  );
}
