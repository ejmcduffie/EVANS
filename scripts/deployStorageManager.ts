require('@openzeppelin/hardhat-upgrades');
import { ethers } from "hardhat";
import hre from "hardhat";

// Debug: Log script start
console.log("[DEBUG] Script started");

async function main() {
  console.log("=== Starting deployment script ===");
  
  try {
    // Log network info
    const network = await ethers.provider.getNetwork();
    console.log("\n[1/7] Network:", network.name, "(Chain ID:", network.chainId + ")");
    
    // Get deployer info
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    console.log("[2/7] Deployer address:", deployerAddress);
    
    const balance = await ethers.provider.getBalance(deployerAddress);
    console.log("[3/7] Deployer balance:", ethers.formatEther(balance), "MATIC");

    // Check for required environment variables
    const ANC_TOKEN_ADDRESS = process.env.ANC_TOKEN_ADDRESS || "";
    if (!ANC_TOKEN_ADDRESS) {
      throw new Error("ERROR: ANC_TOKEN_ADDRESS not set in .env file");
    }
    console.log("[4/7] ANC Token Address:", ANC_TOKEN_ADDRESS);

    console.log("[5/7] Loading StorageManager contract...");
    const StorageManager = await ethers.getContractFactory("StorageManager");
    
    console.log("[6/7] Deploying proxy... (this may take a few minutes)");
    const storageManager = await hre.upgrades.deployProxy(
      StorageManager, 
      [ANC_TOKEN_ADDRESS],
      { 
        initializer: "initialize",
        timeout: 300000 // 5 minutes timeout
      }
    );
    
    console.log("  - Waiting for deployment confirmation...");
    await storageManager.waitForDeployment();
    
    const address = await storageManager.getAddress();
    console.log("\n=== Deployment Successful ===");
    console.log("Contract address:", address);
    
    const deploymentTx = storageManager.deploymentTransaction();
    if (deploymentTx) {
      console.log("Transaction hash:", deploymentTx.hash);
      console.log("Waiting for transaction receipt...");
      const receipt = await deploymentTx.wait();
      console.log("Block number:", receipt?.blockNumber);
      console.log("Gas used:", receipt?.gasUsed.toString());
    }
    
    // Verify on block explorer if possible
    if (network.name !== 'hardhat' && network.name !== 'localhost') {
      console.log("\nTo verify the contract on Polygonscan, run:");
      console.log(`npx hardhat verify --network ${network.name} ${address} ${ANC_TOKEN_ADDRESS}`);
    }
    
  } catch (error) {
    console.error("\n=== Deployment Failed ===");
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