// Simple Hardhat test script
const hre = require("hardhat");

async function main() {
  console.log("=== Hardhat Test Script ===\n");
  
  // 1. Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log("[1/3] Network:", network.name, "(Chain ID:", network.chainId + ")");
  
  // 2. Get signers
  const [deployer] = await hre.ethers.getSigners();
  console.log("[2/3] Deployer address:", await deployer.getAddress());
  
  // 3. Get balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("[3/3] Balance:", hre.ethers.formatEther(balance), "ETH");
  
  console.log("\n=== Test completed successfully ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
