"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface FileUploadFormProps {
  fileCategory: 'GEDCOM' | 'SlaveRecord' | 'HistoricalDocument' | 'FamilyTree' | 'DNATest' | 'Other' | 'All';
  allowedExtensions?: string[];
  maxSizeMB?: number;
  title: string;
  description: string;
  onUploadSuccess?: (fileInfo: { fileId: string; fileName: string; fileType: string; fileSize: number }) => void;
}

const FileUploadForm: React.FC<FileUploadFormProps> = ({
  fileCategory,
  allowedExtensions = ['.ged'],
  maxSizeMB = 25,
  title,
  description,
  onUploadSuccess
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success: boolean;
    message: string;
    fileId?: string;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  // Demo mode - no authentication required
  const demoMode = true;

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (selectedFiles: File | File[]) => {
    const filesToProcess = Array.isArray(selectedFiles) ? selectedFiles : [selectedFiles];
    
    // Validate all files
    let hasError = false;
    for (const file of filesToProcess) {
      // Validate file extension
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExtensions.includes(fileExt)) {
        setError(`Invalid file type: ${file.name}. Allowed extensions: ${allowedExtensions.join(', ')}`);
        hasError = true;
        break;
      }

      // Validate file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        setError(`File too large: ${file.name}. Maximum size allowed is ${maxSizeMB}MB`);
        hasError = true;
        break;
      }
    }

    if (!hasError) {
      setFiles(prev => [...prev, ...filesToProcess]);
      setError(null);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Please select at least one file first');
      return;
    }
    setUploadStatus(null);
    setUploadProgress(0);
    setError(null);
    setUploading(true);

    // DEMO MODE: Simulate successful upload with content storage
    if (demoMode) {
      // Simulate upload progress for multiple files
      let filesProcessed = 0;
      setUploadProgress(10);
      
      // Process each file sequentially
      const processFiles = async () => {
        for (const file of files) {
          await new Promise<void>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const fileDataUrl = reader.result as string;
              // Update progress based on files processed
              filesProcessed++;
              setUploadProgress(Math.round((filesProcessed / files.length) * 100));
              // Create a record of the file
              const newFileData = {
                id: 'demo-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9),
                name: file.name,
                fileCategory,
                status: 'Pending',
                size: file.size,
                createdAt: new Date(),
                content: fileDataUrl
              };
              
              // Update localStorage with new file
              const existingFiles = JSON.parse(localStorage.getItem('files') || '[]');
              const updatedFiles = [newFileData, ...existingFiles];
              localStorage.setItem('files', JSON.stringify(updatedFiles));
              
              // Notify dashboard about this file
              localStorage.setItem('newFileUpload', JSON.stringify(newFileData));
              localStorage.removeItem('newFileUpload');
              
              // Callback for each file if provided
              onUploadSuccess && onUploadSuccess({
                fileId: newFileData.id,
                fileName: file.name,
                fileType: fileCategory,
                fileSize: file.size
              });
              
              resolve();
            };
            reader.readAsDataURL(file);
          });
        }
        
        // All files processed
        setUploadStatus({
          success: true,
          message: `${files.length} ${files.length === 1 ? 'file' : 'files'} uploaded successfully!`
        });
        setFiles([]);
        setUploading(false);
      };
      
      // Start processing files locally (for demo UI) but continue to upload to backend
      await processFiles();
    }
    // Non-demo mode implementation would go here
    setUploading(false);
    
    // Existing upload logic for non-demo mode
    try {
      setUploading(true);
      
      // Create form data for the API request (demo mode)
      const formData = new FormData();
      // API expects the GEDCOM file in a field named 'file'. We'll send the first file.
      if (files.length > 0) {
        formData.append('file', files[0]);
      }
      formData.append('userId', 'demo-user');
      formData.append('fileCategory', fileCategory);
      formData.append('demo', 'true');  // Indicate this is a demo upload

      // Send request to the API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus({
          success: true,
          message: 'File uploaded successfully!',
          fileId: result.fileId
        });
        setFiles([]);
        
        // In demo mode, we don't need to refresh the page
        // Just show success message
      } else {
        setUploadStatus({
          success: false,
          message: result.error || 'Failed to upload file'
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        success: false,
        message: 'An error occurred during file upload'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <p className="mb-6 text-gray-700">{description}</p>
      
      <form onSubmit={handleSubmit}>
        <div 
          className={`border-2 border-dashed ${dragActive ? 'border-primary' : 'border-gray-300'} rounded-lg p-8 text-center mb-6 hover:border-primary transition-colors duration-200`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          {files.length > 0 ? (
            <div className="mb-4">
              <p className="text-gray-800 font-medium">Selected Files: {files.length}</p>
              <div className="max-h-32 overflow-auto text-sm">
                {files.map((file, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-gray-100 py-1 last:border-0">
                    <p className="text-primary truncate max-w-xs">{file.name}</p>
                    <p className="text-gray-500 text-xs ml-2">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ))}
              </div>
              <button 
                type="button" 
                className="text-xs text-red-600 mt-2 hover:underline"
                onClick={() => setFiles([])}
              >
                Clear All
              </button>
            </div>
          ) : (
            <p className="text-gray-600 mb-2">Drag and drop your files here, or</p>
          )}
          
          <button 
            type="button" 
            className="btn-primary"
            onClick={handleButtonClick}
          >
            Browse Files
          </button>
          
          <input 
            type="file"
            ref={inputRef}
            className="hidden"
            multiple
            accept={allowedExtensions.join(',')} 
            onChange={(e) => e.target.files && e.target.files.length > 0 && handleFileChange(Array.from(e.target.files))}
          />
          
          <p className="text-xs text-gray-500 mt-2">
            Supported files: {allowedExtensions.join(', ')} (Max size: {maxSizeMB}MB)
          </p>
        </div>
        
        {uploadStatus && (
          <div className={`p-4 mb-6 rounded-lg ${uploadStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <div className="flex items-center">
              {uploadStatus.success ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{uploadStatus.message}</span>
            </div>
            {uploadStatus.success && uploadStatus.fileId && (
              <p className="mt-2 text-sm">
                File ID: <span className="font-mono">{uploadStatus.fileId}</span>
              </p>
            )}
          </div>
        )}
        
        {error && (
          <div className="p-4 mb-6 rounded-lg bg-red-50 text-red-800">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <button 
            type="submit"
            className="btn-primary px-8"
            disabled={files.length === 0 || uploading}
          >
            {uploading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-secondary-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              'Upload and Verify'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FileUploadForm;
