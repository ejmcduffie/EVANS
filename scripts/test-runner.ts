// Simple test runner to check script execution
console.log("=== Script Execution Test ===\n");

// Test 1: Basic console output
console.log("1. Testing console output...");

// Test 2: Environment variables
console.log("\n2. Testing environment variables:");
console.log("- NODE_ENV:", process.env.NODE_ENV || 'not set');
console.log("- Hardhat network:", process.env.HARDHAT_NETWORK || 'not set');

// Test 3: File system access
try {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.resolve('.env');
  const envExists = fs.existsSync(envPath);
  
  console.log("\n3. Testing file system access:");
  console.log("- .env file exists:", envExists);
  if (envExists) {
    console.log("- .env file size:", fs.statSync(envPath).size, "bytes");
  }
} catch (error) {
  console.error("File system access error:", error instanceof Error ? error.message : error);
}

// Test 4: Network access (async)
console.log("\n4. Testing network access...");
(async () => {
  try {
    const { ethers } = require('ethers');
    const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
    const blockNumber = await provider.getBlockNumber();
    console.log("- Successfully connected to network, latest block:", blockNumber);
  } catch (error) {
    console.error("- Network access error:", error instanceof Error ? error.message : error);
  }
})();

console.log("\n=== Test script completed ===");
console.log("Note: Some tests may still be running asynchronously.");
