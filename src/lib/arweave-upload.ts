import { uploadToArweave, getFromArweave } from './arweave';

/**
 * Upload a file to Arweave
 * @param file The file to upload (File object from browser or path in Node.js)
 * @param options Additional options for the upload
 * @returns Promise with upload result
 */
export async function uploadFileToArweave(
  file: File | string,
  options: {
    tags?: Record<string, string>;
    isNode?: boolean;
  } = {}
) {
  const { tags = {}, isNode = false } = options;

  try {
    let data: string | Uint8Array | ArrayBuffer;
    let contentType = 'application/octet-stream';

    if (isNode) {
      // Node.js environment
      const fs = require('fs');
      const path = require('path');
      
      // If file is a path, read the file
      const filePath = typeof file === 'string' ? file : '';
      const fileName = path.basename(filePath);
      data = fs.readFileSync(filePath);
      
      // Try to determine content type from file extension
      const ext = path.extname(filePath).toLowerCase();
      if (ext === '.json') contentType = 'application/json';
      if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      if (ext === '.png') contentType = 'image/png';
      if (ext === '.pdf') contentType = 'application/pdf';
      
      // Add filename to tags if not provided
      if (!tags['File-Name']) {
        tags['File-Name'] = fileName;
      }
    } else {
      // Browser environment
      if (!(file instanceof File)) {
        throw new Error('In browser environment, file must be a File object');
      }
      
      data = await file.arrayBuffer();
      contentType = file.type || 'application/octet-stream';
      
      // Add filename to tags if not provided
      if (!tags['File-Name']) {
        tags['File-Name'] = file.name;
      }
    }

    // Add content type to tags
    if (!tags['Content-Type']) {
      tags['Content-Type'] = contentType;
    }

    // Upload to Arweave
    return await uploadToArweave({
      data,
      tags,
      contentType
    });
  } catch (error) {
    console.error('Error in uploadFileToArweave:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during file upload'
    };
  }
}

/**
 * Upload JSON data to Arweave
 * @param data The JSON data to upload
 * @param tags Additional tags for the upload
 * @returns Promise with upload result
 */
export async function uploadJsonToArweave<T extends object>(
  data: T,
  tags: Record<string, string> = {}
) {
  try {
    const jsonString = JSON.stringify(data);
    return await uploadToArweave({
      data: jsonString,
      tags: {
        'Content-Type': 'application/json',
        ...tags
      },
      contentType: 'application/json'
    });
  } catch (error) {
    console.error('Error in uploadJsonToArweave:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during JSON upload'
    };
  }
}

export { getFromArweave };
