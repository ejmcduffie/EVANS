// Simple test script to check if basic JavaScript execution works
console.log("=== Simple Test Script ===");
console.log("If you see this message, basic JavaScript execution is working!");
console.log("Node.js version:", process.version);
console.log("Current directory:", __dirname);
console.log("Environment variables:", {
  NODE_ENV: process.env.NODE_ENV || 'not set',
  HARDHAT_NETWORK: process.env.HARDHAT_NETWORK || 'not set',
  AMOY_RPC_URL: process.env.AMOY_RPC_URL ? 'set' : 'not set'
});
