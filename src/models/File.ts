import { v4 as uuidv4 } from 'uuid';
import { saveFileRecord, getFileById, FileRecord, getAllFiles } from '@/lib/fileDb';

export interface IFile {
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

export const createFile = async (fileData: Omit<IFile, 'id' | 'uploadDate' | 'status'>): Promise<IFile> => {
  return await saveFileRecord(fileData);
};

export const getFile = async (id: string): Promise<IFile | null> => {
  return await getFileById(id);
};

export const listFiles = async (): Promise<IFile[]> => {
  return await getAllFiles();
};

// For backward compatibility
export const FileUpload = {
  create: createFile,
  findById: getFile,
  find: () => ({
    sort: () => ({
      exec: async () => await listFiles()
    })
  })
} as any;
