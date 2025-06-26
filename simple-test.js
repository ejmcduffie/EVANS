const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Define constants
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DB_DIR = path.join(__dirname, 'db_access');
const FILES_DB_DIR = path.join(DB_DIR, 'files');
const TEST_FILE_PATH = path.join(__dirname, 'test beta.ged');

// Generate a file hash
function generateFileHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// Ensure directories exist
function ensureDirectories() {
  const dirs = [UPLOADS_DIR, DB_DIR, FILES_DB_DIR];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

// Save file record to JSON
function saveFileRecord(fileData) {
  const id = crypto.randomUUID();
  const record = {
    ...fileData,
    id,
    uploadDate: new Date().toISOString(),
    status: 'uploaded'
  };
  
  const filePath = path.join(FILES_DB_DIR, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(record, null, 2));
  
  return record;
}

// Main function to simulate file upload
async function simulateFileUpload() {
  try {
    console.log('Initializing directories...');
    ensureDirectories();
    
    console.log(`Reading test file: ${TEST_FILE_PATH}`);
    if (!fs.existsSync(TEST_FILE_PATH)) {
      throw new Error(`Test file not found: ${TEST_FILE_PATH}`);
    }
    
    const fileBuffer = fs.readFileSync(TEST_FILE_PATH);
    const fileStats = fs.statSync(TEST_FILE_PATH);
    
    // Get file details
    const originalName = path.basename(TEST_FILE_PATH);
    const fileType = path.extname(TEST_FILE_PATH);
    const fileSize = fileStats.size;
    const fileCategory = 'gedcom';
    
    // Generate hash
    const verificationHash = generateFileHash(fileBuffer);
    
    // Create upload directory for file category
    const uploadDir = path.join(UPLOADS_DIR, fileCategory);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${crypto.randomUUID()}${fileType}`;
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
      userId: 'demo-user-123',
      verificationHash
    };
    
    console.log('Saving file record to database...');
    const savedFile = saveFileRecord(fileData);
    
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
  });
