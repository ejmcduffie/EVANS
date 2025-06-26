import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { mkdir } from 'fs/promises';

const DB_DIR = 'C:\\Users\\Mythi\\Pictures\\NewCode\\db_access';
const FILES_DIR = path.join(DB_DIR, 'files');

// Ensure database directories exist
async function ensureDbDirectories() {
  try {
    await mkdir(DB_DIR, { recursive: true });
    await mkdir(FILES_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating database directories:', error);
    throw error;
  }
}

// Initialize the database
async function initDb() {
  await ensureDbDirectories();
  console.log('File-based database initialized');
}

// File operations
interface FileRecord {
  id: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  fileCategory: string;
  uploadDate: string;
  status: string;
  path: string;
  userId: string;
  nftDetails?: any;
  verificationHash?: string;
}

// Save file record
async function saveFileRecord(fileData: Omit<FileRecord, 'id' | 'uploadDate' | 'status'>): Promise<FileRecord> {
  const fileRecord: FileRecord = {
    ...fileData,
    id: uuidv4(),
    uploadDate: new Date().toISOString(),
    status: 'uploaded'
  };

  const filePath = path.join(FILES_DIR, `${fileRecord.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(fileRecord, null, 2));
  
  return fileRecord;
}

// Get file by ID
async function getFileById(id: string): Promise<FileRecord | null> {
  try {
    const filePath = path.join(FILES_DIR, `${id}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

// Get all files (for demo purposes)
async function getAllFiles(): Promise<FileRecord[]> {
  try {
    const files = await fs.readdir(FILES_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const fileRecords = await Promise.all(
      jsonFiles.map(async (file) => {
        const data = await fs.readFile(path.join(FILES_DIR, file), 'utf-8');
        return JSON.parse(data);
      })
    );
    
    return fileRecords;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

export {
  initDb,
  saveFileRecord,
  getFileById,
  getAllFiles,
  FileRecord
};
