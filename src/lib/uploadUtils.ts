import { mkdir, access, constants, unlink } from 'fs/promises';
import path from 'path';

// Base directory for uploads
const UPLOADS_BASE = 'C:\\Users\\Mythi\\Pictures\\NewCode\\db_access\\uploads';

/**
 * Ensures that the uploads directory and its subdirectories exist
 * Creates them if they don't exist
 */
export async function ensureUploadsDirectory(subfolder?: string): Promise<string> {
  try {
    const targetDir = subfolder ? path.join(UPLOADS_BASE, subfolder) : UPLOADS_BASE;
    
    try {
      // Check if directory exists
      await access(targetDir, constants.F_OK);
    } catch (error) {
      // Directory doesn't exist, create it
      console.log(`Creating directory: ${targetDir}`);
      await mkdir(targetDir, { recursive: true });
    }
    
    return targetDir;
  } catch (error) {
    console.error('Error in ensureUploadsDirectory:', error);
    throw error;
  }
}

/**
 * Helper function to clean up files
 */
export async function cleanupFile(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
    console.log(`Cleaned up file: ${filePath}`);
  } catch (error) {
    console.error(`Error cleaning up file ${filePath}:`, error);
    // Don't throw error for cleanup failures
  }
}

/**
 * Checks if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
