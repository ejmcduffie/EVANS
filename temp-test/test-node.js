// Simple Node.js test script
console.log("=== Node.js Test Script ===");
console.log("Node.js version:", process.version);
console.log("Current directory:", process.cwd());
console.log("Environment variables:", {
  NODE_ENV: process.env.NODE_ENV || 'not set',
  PATH: process.env.PATH ? 'set' : 'not set'
});

// Test file system access
try {
  const fs = require('fs');
  const files = fs.readdirSync('.');
  console.log("\nFiles in current directory:", files);
} catch (error) {
  console.error("File system access error:", error.message);
}

console.log("\n=== Test Script Completed ===");
