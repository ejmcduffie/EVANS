import { ethers } from "hardhat";

async function main() {
  console.log("=== Starting debug deployment script ===");
  
  try {
    // 1. Get network info
    const network = await ethers.provider.getNetwork();
    console.log("\n[1/4] Network:", network.name, "(Chain ID:", network.chainId + ")");
    
    // 2. Get deployer info
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    console.log("[2/4] Deployer address:", deployerAddress);
    
    const balance = await ethers.provider.getBalance(deployerAddress);
    console.log("[3/4] Deployer balance:", ethers.formatEther(balance), "MATIC");

    // 3. Simple contract deployment test
    console.log("[4/4] Attempting to deploy a simple contract...");
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    console.log("  - Contract factory created");
    
    const simpleStorage = await SimpleStorage.deploy();
    console.log("  - Deployment transaction sent, waiting for confirmation...");
    
    await simpleStorage.waitForDeployment();
    const address = await simpleStorage.getAddress();
    console.log("\n=== Deployment Successful ===");
    console.log("SimpleStorage deployed to:", address);
    
  } catch (error) {
    console.error("\n=== Debug Deployment Failed ===");
    if (error instanceof Error) {
      console.error("Error:", error.message);
      if (error.stack) {
        console.error("\nStack trace:");
        console.error(error.stack);
      }
    } else {
      console.error("Unknown error:", error);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
