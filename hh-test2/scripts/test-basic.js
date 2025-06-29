// Simple test script for hh-test2
console.log("=== Starting Basic Test (hh-test2) ===");

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
    
    // Test balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("5. Deployer balance:", hre.ethers.formatEther(balance), "ETH");
    
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
