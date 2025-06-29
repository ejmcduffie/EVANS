// Simple test script to verify basic JavaScript execution
console.log("=== Basic Test Script ===");
console.log("This is a test message to verify script execution.");
console.log("Node.js version:", process.version);
console.log("Current directory:", __dirname);

// Test environment variables
console.log("\nEnvironment Variables:");
console.log("NODE_ENV:", process.env.NODE_ENV || 'not set');
console.log("Current working directory:", process.cwd());

// Test file system access
try {
  const fs = require('fs');
  const files = fs.readdirSync('.');
  console.log("\nFiles in current directory:", files);
} catch (error) {
  console.error("File system access error:", error.message);
}

console.log("\n=== Test Script Completed ===");
