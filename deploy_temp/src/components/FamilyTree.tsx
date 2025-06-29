'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FamilyMember {
  id: string;
  name: string;
  givenName: string;
  surname: string;
  sex?: 'M' | 'F' | 'U';
  birthDate?: string;
  deathDate?: string;
  partners?: FamilyMember[];
  children?: FamilyMember[];
}

interface FamilyTreeProps {
  initialData?: {
    tree: FamilyMember;
    fileName: string;
    uploadDate: string;
  } | null;
}

export default function FamilyTree({ initialData = null }: FamilyTreeProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [treeData, setTreeData] = useState<FamilyMember | null>(initialData?.tree || null);
  const [metadata, setMetadata] = useState<{fileName?: string; uploadDate?: string}>({});
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [generations, setGenerations] = useState(4);

  const fetchFamilyTree = useCallback(async () => {
    if (status === 'loading') return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/family-tree');
      
      // Handle non-JSON responses (like 404)
      if (response.status === 404) {
        setError('No family tree data found. Please upload a GEDCOM file to get started.');
        setTreeData(null);
        return;
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle specific error cases
        if (data.code === 'NO_GEDCOM_FILES') {
          setError('No GEDCOM files found. Please upload a GEDCOM file to view your family tree.');
          setTreeData(null);
          return;
        }
        throw new Error(data.error || data.message || 'Failed to load family tree');
      }
      
      console.log('Received family tree data:', data);
      
      // Handle both direct tree data and nested tree property
      const treeData = data.tree || data;
      if (!treeData) {
        throw new Error('No tree data found in the response');
      }
      
      setTreeData(treeData);
    } catch (err) {
      console.error('Error fetching family tree:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load family tree';
      setError(errorMessage);
      setTreeData(null);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (!initialData) {
      fetchFamilyTree();
    }
  }, [initialData, fetchFamilyTree]);

  const renderPerson = (person: FamilyMember, level = 0) => {
    if (!person) return null;
    
    const isMale = person.sex === 'M';
    const isFemale = person.sex === 'F';
    const bgColor = isMale ? 'bg-blue-50' : isFemale ? 'bg-pink-50' : 'bg-purple-50';
    const borderColor = isMale ? 'border-blue-200' : isFemale ? 'border-pink-200' : 'border-purple-200';
    const name = person.name || `${person.givenName || ''} ${person.surname || ''}`.trim() || 'Unknown';
    
    // Format dates for display
    const formatDate = (dateStr?: string) => {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString();
      } catch {
        return dateStr;
      }
    };
    
    const birthDate = formatDate(person.birthDate);
    const deathDate = formatDate(person.deathDate);
    
    return (
      <div key={`${person.id}-${level}`} className="flex flex-col items-center mx-2">
        <div 
          className={`w-20 h-20 md:w-24 md:h-24 rounded-full ${bgColor} border-2 ${borderColor} flex items-center justify-center mb-1 shadow-sm hover:shadow-md transition-all transform hover:scale-105`}
          title={`${name}${birthDate ? `\nBorn: ${birthDate}` : ''}${deathDate ? `\nDied: ${deathDate}` : ''}`}
        >
          <span className="text-2xl">
            {isMale ? '👨' : isFemale ? '👩' : '👤'}
          </span>
        </div>
        <div className="text-center max-w-[100px] md:max-w-[120px] px-1">
          {person.givenName && (
            <div className="font-medium text-xs md:text-sm truncate">{person.givenName}</div>
          )}
          {person.surname && (
            <div className="font-bold text-xs md:text-sm truncate">{person.surname}</div>
          )}
          {birthDate && (
            <div className="text-[10px] md:text-xs text-gray-500 truncate">
              b. {birthDate}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderGenerations = (person: FamilyMember, depth = 0, maxDepth = 4) => {
    if (depth > maxDepth || !person) return null;
    
    // Ensure we have arrays for partners and children
    const partners = Array.isArray(person.partners) ? person.partners : [];
    const children = Array.isArray(person.children) ? person.children : [];
    
    // Only show a limited number of children to prevent UI overload
    const visibleChildren = children.slice(0, 5);
    const hasMoreChildren = children.length > 5;
    
    return (
      <div key={`${person.id}-${depth}`} className="flex flex-col items-center">
        {/* Current person and their partners */}
        <div className="flex items-start">
          {renderPerson(person, depth)}
          
          {partners.length > 0 && (
            <div className="flex items-center">
              <div className="w-4 h-1 bg-gray-300 mx-1"></div>
              {partners.map((partner, idx) => (
                <React.Fragment key={`partner-${partner.id || idx}`}>
                  {idx > 0 && <div className="mx-1 text-gray-400">+</div>}
                  {renderPerson(partner, depth)}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
        
        {/* Children */}
        {visibleChildren.length > 0 && (
          <div className="mt-4">
            <div className="h-6 flex justify-center">
              <div className="w-0.5 h-full bg-gray-300"></div>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {visibleChildren.map((child, idx) => (
                <div key={`child-${child.id || idx}`} className="flex flex-col items-center">
                  {renderGenerations(child, depth + 1, maxDepth)}
                </div>
              ))}
              {hasMoreChildren && (
                <div className="flex items-center text-gray-500 text-sm">
                  +{children.length - 5} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {error.includes('404') ? 'Family Tree Not Found' : 'Something went wrong'}
          </h3>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <div className="mt-6">
            <Link 
              href="/upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Upload GEDCOM File
            </Link>
          </div>
          <div className="mt-4">
            <div className="-mx-2 -my-1.5 flex">
              <button
                type="button"
                onClick={fetchFamilyTree}
                className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => router.push('/upload')}
                className="ml-3 bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
              >
                Upload GEDCOM
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    );
  }

  // Show metadata if available
  const renderMetadata = () => {
    if (!metadata.fileName && !metadata.uploadDate) return null;
    
    return (
      <div className="mb-6 text-center text-sm text-gray-500">
        {metadata.fileName && (
          <p>File: <span className="font-medium">{metadata.fileName}</span></p>
        )}
        {metadata.uploadDate && (
          <p>Uploaded: <span className="font-medium">
            {new Date(metadata.uploadDate).toLocaleDateString()}
          </span></p>
        )}
      </div>
    );
  };

  if (!treeData) {
    return (
      <div className="text-center py-12 px-4">
        <h3 className="text-lg font-medium text-gray-900">No family tree data available</h3>
        <p className="mt-2 text-sm text-gray-500">
          {error || "We couldn't find any family tree data to display."}
        </p>
        {renderMetadata()}
        <div className="mt-6 space-x-4">
          <button
            onClick={fetchFamilyTree}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/upload')}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Upload GEDCOM
          </button>
        </div>
      </div>
    );
  }

  // Main tree view when we have data
  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2 md:mb-0">Family Tree</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setGenerations(prev => Math.max(1, prev - 1))}
            disabled={generations <= 1}
            className={`px-3 py-1 rounded-md ${generations <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
          >
            Show Less
          </button>
          <button
            onClick={() => setGenerations(prev => Math.min(prev + 1, 6))}
            disabled={generations >= 6}
            className={`px-3 py-1 rounded-md ${generations >= 6 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
          >
            Show More
          </button>
          <button
            onClick={fetchFamilyTree}
            className="px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Refresh
          </button>
        </div>
      </div>
      
      {renderMetadata()}
      
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full py-4">
          <div className="overflow-hidden">
            {renderGenerations(treeData, 0, generations)}
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            Showing {generations} generation{generations !== 1 ? 's' : ''} of family tree
          </div>
        </div>
      </div>
    </div>
  );
}
