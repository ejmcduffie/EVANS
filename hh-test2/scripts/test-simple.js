// Simple test script for hh-test2
console.log("=== Starting Simple Test ===");

// Test basic require
const hre = require("hardhat");
console.log("1. Hardhat require successful");

// Test async/await
async function main() {
  try {
    console.log("2. Testing async/await...");
    
    // Test network info
    const network = await hre.network;
    console.log(`3. Network: ${network.name} (${network.config.chainId || 'N/A'})`);
    
    // Test getting signers
    const [deployer] = await hre.ethers.getSigners();
    console.log("4. Deployer address:", await deployer.getAddress());
    
    console.log("=== Test completed successfully ===");
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
