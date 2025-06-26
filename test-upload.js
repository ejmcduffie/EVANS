import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define constants
const DEMO_USER_ID = 'demo-user-123';
const TEST_FILE_PATH = './test beta.ged';

// Generate a file hash
const generateFileHash = (buffer) => {
  return createHash('sha256').update(buffer).digest('hex');
};

// Main function to simulate file upload
async function simulateFileUpload() {
  try {
    console.log('Initializing database...');
    
    // Import file-based database functions dynamically
    const fileDbModule = await import('./src/lib/fileDb.js');
    const uploadUtilsModule = await import('./src/lib/uploadUtils.js');
    
    const { initDb, saveFileRecord } = fileDbModule;
    const { ensureUploadsDirectory } = uploadUtilsModule;
    
    await initDb();
    
    console.log(`Reading test file: ${TEST_FILE_PATH}`);
    const fileBuffer = fs.readFileSync(TEST_FILE_PATH);
    const fileStats = fs.statSync(TEST_FILE_PATH);
    
    // Get file details
    const originalName = path.basename(TEST_FILE_PATH);
    const fileType = path.extname(TEST_FILE_PATH);
    const fileSize = fileStats.size;
    const fileCategory = 'gedcom';
    
    // Generate hash
    const verificationHash = generateFileHash(fileBuffer);
    
    // Ensure uploads directory exists
    const uploadDir = await ensureUploadsDirectory(fileCategory);
    const uniqueFilename = `${Date.now()}-${uuidv4()}${fileType}`;
    const filePath = path.join(uploadDir, uniqueFilename);
    
    console.log(`Saving file to: ${filePath}`);
    fs.writeFileSync(filePath, fileBuffer);
    
    // Save file record to database
    const fileData = {
      originalName,
      fileType,
      fileSize,
      fileCategory,
      path: filePath,
      userId: DEMO_USER_ID,
      verificationHash
    };
    
    console.log('Saving file record to database...');
    const savedFile = await saveFileRecord(fileData);
    
    console.log('File upload simulation completed successfully!');
    console.log('File details:', savedFile);
    
    return savedFile;
  } catch (error) {
    console.error('Error in file upload simulation:', error);
    throw error;
  }
}

// Run the simulation
simulateFileUpload()
  .then(result => {
    console.log('Simulation completed successfully!');
  })
  .catch(error => {
    console.error('Simulation failed:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  });
