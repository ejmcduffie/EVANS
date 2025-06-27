'use client';

import React, { useState, useEffect } from 'react';
import DashboardHeader from './components/DashboardHeader';
import FileList from './components/FileList';
import RecentActivity from './components/RecentActivity';
import DashboardCard from './components/DashboardCard';
import DeFiDashboard from './components/DeFiDashboard';
import DAOGovernancePanel from './components/DAOGovernancePanel';
import VerifiedAncestors from './components/VerifiedAncestors';
import FamilyStatistics from './components/FamilyStatistics';
import NFTCollection from './components/NFTCollection';

// Properly defined type for files
type FileType = {
  id: string;
  name: string;
  fileCategory: string;
  status: string;
  size: number;
  createdAt: Date;
};

// Type for blockchain activity items
type ActivityItem = {
  type: 'verification' | 'nft' | 'defi' | 'dao' | 'download' | 'delete';
  timestamp: Date;
  message: string;
};

export default function Dashboard() {
  // Demo mode - always authenticated
  const isAuthenticated = true;
  
  // Tab navigation state
  const [activeTab, setActiveTab] = useState<'overview' | 'defi' | 'dao'>('overview');
  
  // Blockchain activity simulation
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  
  // Mock data for file management
  const initialMockFiles = [
    {
      id: 'f1',
      name: 'HouseStark_FamilyTree.ged',
      fileCategory: 'GEDCOM',
      status: 'Verified',
      size: 1024 * 1024 * 3.2, // 3.2MB
      createdAt: new Date('2025-06-25') // 2 days ago
    },
    {
      id: 'f2',
      name: 'Eddard_Stark_Profile.jpg',
      fileCategory: 'Image',
      status: 'NFT_Minted',
      size: 1024 * 1024 * 2.8, // 2.8MB
      createdAt: new Date('2025-06-20') // 1 week ago
    },
    {
      id: 'f3',
      name: 'Stark_Lineage_Report.pdf',
      fileCategory: 'Document',
      status: 'Pending',
      size: 1024 * 1024 * 1.5, // 1.5MB
      createdAt: new Date('2025-06-26') // 1 day ago
    },
    {
      id: 'f4',
      name: 'Winterfell_Deeds.pdf',
      fileCategory: 'Document',
      status: 'Verified',
      size: 1024 * 1024 * 4.7, // 4.7MB
      createdAt: new Date('2025-05-15') // 1 month ago
    },
    {
      id: 'f5',
      name: 'Jon_Snow_Birth_Record.pdf',
      fileCategory: 'Document',
      status: 'NFT_Minted',
      size: 1024 * 1024 * 0.9, // 0.9MB
      createdAt: new Date('2025-06-10') // 2 weeks ago
    }
  ];
  
  const [files, setFiles] = useState<FileType[]>(initialMockFiles);
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingMint, setIsProcessingMint] = useState<string | null>(null);
  
  // Selected files state
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  
  // Handle file selection change
  const handleFileSelectionChange = (fileIds: string[]) => {
    setSelectedFileIds(fileIds);
  };
  
  // Write selected files to blockchain
  const writeFilesToBlockchain = async () => {
    if (selectedFileIds.length === 0) {
      alert('Please select at least one file to write to blockchain');
      return;
    }
    
    // In a real implementation, this would call an API to write files to blockchain
    // For demo purposes, we'll simulate this process
    const selectedFiles = files.filter(file => selectedFileIds.includes(file.id));
    
    try {
      // Update status to Processing
      const updatedFiles = files.map(file => 
        selectedFileIds.includes(file.id) 
          ? { ...file, status: 'Processing' } 
          : file
      );
      setFiles(updatedFiles);
      localStorage.setItem('files', JSON.stringify(updatedFiles));
      
      // Simulate blockchain writing process
      setTimeout(() => {
        // Use the current state of files when updating
        setFiles(currentFiles => {
          const verifiedFiles = currentFiles.map(file => 
            selectedFileIds.includes(file.id) 
              ? { ...file, status: 'Verified' } 
              : file
          );
          localStorage.setItem('files', JSON.stringify(verifiedFiles));
          return verifiedFiles;
        });
        
        // Add activity for each file
        const newActivities = selectedFiles.map(file => ({
          type: 'verification' as const,
          timestamp: new Date(),
          message: `Verified ${file.name} on blockchain`
        }));
        
        setRecentActivity(prev => [...newActivities, ...prev]);
        setSelectedFileIds([]);
        
        alert(`Successfully verified ${selectedFiles.length} file(s) on blockchain`);
      }, 2000);
    } catch (error: any) {
      console.error('Blockchain write error:', error);
      alert(`Failed to write files to blockchain: ${error.message}`);
    }
  };
  
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 3,
    totalPages: 1,
    hasMore: false
  });
  
  // DeFi and DAO integration with verification boosters
  const [verificationBoost, setVerificationBoost] = useState(1.0); // Base multiplier
  const [verificationPowerMultiplier, setVerificationPowerMultiplier] = useState(1.0); // Base multiplier

  // Format file size helper
  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format date helper
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get status color helper
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Verified': return 'bg-green-100 text-green-800';
      case 'NFT_Minted': return 'bg-purple-100 text-purple-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon helper
  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'Pending': return '⏳';
      case 'Processing': return '⚙️';
      case 'Verified': return '✅';
      case 'NFT_Minted': return '🔗';
      case 'Failed': return '❌';
      default: return '❓';
    }
  };

  // Mint NFT function
  const mintNFT = async (fileId: string) => {
    setIsProcessingMint(fileId);
    try {
      // Get the file data
      const file = files.find(f => f.id === fileId);
      if (!file) throw new Error('File not found');

      // Call the NFT mint API endpoint
      const response = await fetch('/api/nft-mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId,
          fileData: {
            name: file.name,
            category: file.fileCategory,
            size: file.size,
            createdAt: file.createdAt.toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to mint NFT');
      }

      const result = await response.json();

      // Update the file status
      const updatedFiles = files.map(f => 
        f.id === fileId ? { ...f, status: 'NFT_Minted' } : f
      );
      setFiles(updatedFiles);
      localStorage.setItem('files', JSON.stringify(updatedFiles));

      // Add to recent activity
      setRecentActivity(prev => [
        {
          type: 'nft',
          timestamp: new Date(),
          message: `Minted NFT for ${file.name} (TX: ${result.transactionId})`
        },
        ...prev
      ]);

      alert(`NFT minted successfully! Transaction ID: ${result.transactionId}`);
    } catch (error: any) {
      console.error('NFT mint error:', error);
      alert(`NFT mint failed: ${error.message}`);
    } finally {
      setIsProcessingMint(null);
    }
  };

  const downloadFile = (fileId: string) => {
    try {
      // Find the file in our state
      const file = files.find(f => f.id === fileId);
      if (!file) throw new Error('File not found');
      
      // In demo mode, we need to retrieve the file content from localStorage
      const allFiles = JSON.parse(localStorage.getItem('files') || '[]');
      const fileWithContent = allFiles.find((f: any) => f.id === fileId);
      
      if (!fileWithContent || !fileWithContent.content) {
        throw new Error('File content not available');
      }
      
      // Create a download link for the file
      const link = document.createElement('a');
      link.href = fileWithContent.content;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Add to recent activity
      setRecentActivity(prev => [
        { type: 'download', timestamp: new Date(), message: `Downloaded ${file.name}` },
        ...prev
      ]);
    } catch (error: any) {
      console.error('Download error:', error);
      alert(`Download failed: ${error.message}`);
    }
  };
  
  const deleteFile = async (fileId: string) => {
    try {
      // Find the file in our state
      const file = files.find(f => f.id === fileId);
      if (!file) throw new Error('File not found');
      
      // Confirm deletion
      if (!confirm(`Are you sure you want to delete ${file.name}?`)) {
        return;
      }
      
      // Call the DELETE API endpoint
      const response = await fetch(`/api/upload?fileId=${fileId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete file');
      }
      
      // Remove from state after successful API call
      const updatedFiles = files.filter(f => f.id !== fileId);
      setFiles(updatedFiles);
      
      // Update localStorage
      localStorage.setItem('files', JSON.stringify(updatedFiles));
      
      // Add to recent activity
      setRecentActivity(prev => [
        { type: 'delete', timestamp: new Date(), message: `Deleted ${file.name}` },
        ...prev
      ]);
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(`Delete failed: ${error.message}`);
    }
  };

  // Calculate verification boosts based on verified files
  useEffect(() => {
    const verifiedFilesCount = files.filter(f => 
      f.status === 'Verified' || f.status === 'NFT_Minted'
    ).length;
    
    // More verified files = higher boosts
    setVerificationBoost(1.0 + (verifiedFilesCount * 0.05));
    setVerificationPowerMultiplier(1.0 + (verifiedFilesCount * 0.1));
  }, [files]);
  
  // Use mock data directly in demo mode
  useEffect(() => {
    if (isAuthenticated) {
      // Initialize with existing files from localStorage or mock data
      const storedFiles = localStorage.getItem('files');
      if (storedFiles) {
        try {
          const parsedFiles = JSON.parse(storedFiles);
          // Ensure createdAt is properly converted to Date objects
          const processedFiles = parsedFiles.map((file: any) => ({
            ...file,
            createdAt: new Date(file.createdAt)
          }));
          setFiles(processedFiles);
        } catch (error) {
          console.error('Error parsing stored files:', error);
          setFiles(initialMockFiles);
        }
      } else {
        setFiles(initialMockFiles);
      }
      
      // Check for new file uploads from localStorage
      const checkForNewFiles = () => {
        const newFileUpload = localStorage.getItem('newFileUpload');
        if (newFileUpload) {
          try {
            const newFile = JSON.parse(newFileUpload);
            // Ensure createdAt is a Date object
            newFile.createdAt = new Date(newFile.createdAt);
            
            // Add to files state
            setFiles(prev => {
              // Check if file already exists to prevent duplicates
              if (!prev.some(f => f.id === newFile.id)) {
                const updatedFiles = [newFile, ...prev];
                // Update localStorage with all files
                localStorage.setItem('files', JSON.stringify(updatedFiles));
                return updatedFiles;
              }
              return prev;
            });
            
            // Clear the newFileUpload flag
            localStorage.removeItem('newFileUpload');
          } catch (error) {
            console.error('Error processing new file upload:', error);
          }
        }
      };
      
      // Check immediately and then set up interval
      checkForNewFiles();
      const intervalId = setInterval(checkForNewFiles, 2000);
      
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated]);
  
  // Simulate receiving blockchain events with House Stark theme
  useEffect(() => {
    // This would be replaced with actual blockchain event listeners in production
    const simulateBlockchainEvents = () => {
      const events = [
        {
          type: 'verification' as const,
          message: "Verified Stark lineage records from Winterfell's archives"
        },
        {
          type: 'nft' as const,
          message: 'Minted NFT for Eddard Stark\'s military service record'
        },
        {
          type: 'defi' as const,
          message: 'Staked 1000 WINTER tokens in the North\'s treasury'
        },
        {
          type: 'dao' as const,
          message: 'House Stark DAO approved new family charter'
        },
        {
          type: 'verification' as const,
          message: 'Verified Jon Snow\'s birth record from the Tower of Joy'
        },
        {
          type: 'nft' as const,
          message: 'Created NFT for the original Ice sword blueprint'
        },
        {
          type: 'defi' as const,
          message: 'Earned 250 WINTER tokens from Northern trade routes'
        },
        {
          type: 'dao' as const,
          message: 'Voted on reconstruction of Winterfell\'s east wing'
        }
      ];
      
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setRecentActivity(prev => [
        {
          ...randomEvent,
          timestamp: new Date()
        },
        ...prev
      ].slice(0, 10)); // Keep only the 10 most recent events
    };
    
    // Simulate a blockchain event every 20 seconds
    const eventSimulator = setInterval(simulateBlockchainEvents, 20000);
    
    // Populate with initial activity
    setRecentActivity([
      {
        type: 'verification' as const,
        timestamp: new Date(Date.now() - 5*60000), // 5 minutes ago
        message: 'Verified House Stark family tree back to the Age of Heroes'
      },
      {
        type: 'nft' as const,
        timestamp: new Date(Date.now() - 17*60000), // 17 minutes ago
        message: 'Minted Direwolf sigil NFT for the Stark family'
      },
      {
        type: 'dao' as const,
        timestamp: new Date(Date.now() - 35*60000), // 35 minutes ago
        message: 'Approved new trade agreement with House Manderly'
      },
      {
        type: 'defi' as const,
        timestamp: new Date(Date.now() - 120*60000), // 2 hours ago
        message: 'Earned 500 WINTER tokens from Northern harvest'
      },
      {
        type: 'verification' as const,
        timestamp: new Date(Date.now() - 180*60000), // 3 hours ago
        message: 'Authenticated ancient Stark family documents from the crypts'
      }
    ]);
    
    return () => clearInterval(eventSimulator);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <DashboardHeader 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        verificationBoost={verificationBoost}
        verificationPowerMultiplier={verificationPowerMultiplier}
      />

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <FileList 
              files={files}
              formatFileSize={formatFileSize}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              mintNFT={mintNFT}
              downloadFile={downloadFile}
              deleteFile={deleteFile}
              isProcessingMint={isProcessingMint}
              onSelectionChange={handleFileSelectionChange}
              writeToBlockchain={writeFilesToBlockchain}
            />
            <NFTCollection />
          </div>
          
          <div className="lg:col-span-1">
            <FamilyStatistics />
            <RecentActivity recentActivity={recentActivity} />
            <VerifiedAncestors />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 col-span-1 lg:col-span-3">
            <DashboardCard 
              title="Upload Files"
              description="Upload GEDCOM files, documents, photos, and more to start building your family tree."
              linkText="Go to Upload"
              href="/upload"
            />
            <DashboardCard 
              title="Your Family Tree"
              description="Explore and visualize your family connections with our interactive family tree."
              linkText="View Family Tree"
              href="/genealogy"
            />
            <DashboardCard 
              title="Verification"
              description="Verify your ancestral connections and historical records with blockchain technology."
              linkText="Start Verification"
              href="/verification"
            />
          </div>
        </div>
      )}
      
      {activeTab === 'defi' && (
        <DeFiDashboard verificationBoost={verificationBoost} />
      )}
      
      {activeTab === 'dao' && (
        <DAOGovernancePanel verificationPowerMultiplier={verificationPowerMultiplier} />
      )}
    </div>
  );
}
