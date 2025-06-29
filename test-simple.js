// Simple test script to check environment variable loading
require('dotenv').config({ path: '.env' });

console.log("=== Environment Variable Test ===");
console.log("Node.js version:", process.version);
console.log("Current directory:", __dirname);
console.log("Environment file:", require('path').resolve('.env'));

// Check if .env file exists
const fs = require('fs');
const envPath = require('path').resolve('.env');
const envExists = fs.existsSync(envPath);

console.log("\n[1/3] .env file check:", envExists ? "Found" : "Not found");

if (envExists) {
  console.log("\n[2/3] .env file content:");
  console.log("----------------------------");
  console.log(fs.readFileSync(envPath, 'utf8'));
  console.log("----------------------------");
}

console.log("\n[3/3] Environment variables:");
console.log("----------------------------");
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`HARDHAT_NETWORK: ${process.env.HARDHAT_NETWORK || 'not set'}`);
console.log(`AMOY_RPC_URL: ${process.env.AMOY_RPC_URL ? 'set' : 'not set'}`);
console.log(`PRIVATE_KEY: ${process.env.PRIVATE_KEY ? 'set' : 'not set'}`);
console.log(`ANC_TOKEN_ADDRESS: ${process.env.ANC_TOKEN_ADDRESS || 'not set'}`);
console.log("----------------------------");

if (!process.env.AMOY_RPC_URL) {
  console.error("\n❌ Error: AMOY_RPC_URL is not set in environment variables");
  process.exit(1);
}

console.log("\n✅ Environment variables loaded successfully!");
