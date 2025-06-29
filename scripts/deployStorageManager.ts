// Load environment variables first
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

// Import Hardhat and plugins
import { ethers, upgrades } from "hardhat";
import hre from "hardhat";

// Debug log environment variables
console.log("=== Deployment Script Debug ===");
console.log("Network:", hre.network.name);
console.log("RPC URL:", process.env.AMOY_RPC_URL ? 'set' : 'not set');
console.log("Deployer Private Key:", process.env.PRIVATE_KEY ? 'set' : 'not set');
console.log("ANC Token Address:", process.env.ANC_TOKEN_ADDRESS || 'not set');
console.log("==============================\n");

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
    console.log("Deploying StorageManager proxy...");
    const storageManager = await upgrades.deployProxy(StorageManager, [ANC_TOKEN_ADDRESS], {
      initializer: "initialize",
      kind: 'uups' // Using UUPS proxy pattern
    });
    
    console.log("Waiting for deployment confirmation...");
    await storageManager.waitForDeployment();
    const proxyAddress = await storageManager.getAddress();
  
    console.log("\n=== Deployment Successful ===");
    console.log("StorageManager deployed to:", proxyAddress);
    console.log("Transaction hash:", storageManager.deploymentTransaction()?.hash);
  
    // Verify contract on Polygonscan
    if (hre.network.name === 'amoy') {
      const deploymentTx = storageManager.deploymentTransaction();
      if (deploymentTx) {
        console.log("\nWaiting for block confirmations before verification...");
        const receipt = await deploymentTx.wait(5); // Wait for 5 confirmations
        
        console.log("Transaction receipt received:");
        console.log("- Block number:", receipt?.blockNumber);
        console.log("- Gas used:", receipt?.gasUsed.toString());
        
        console.log("\nVerifying contract on Polygonscan...");
        try {
          await hre.run("verify:verify", {
            address: proxyAddress,
            constructorArguments: [],
          });
          console.log(" Contract verified on Polygonscan!");
        } catch (error) {
          console.warn(" Contract verification failed:", error instanceof Error ? error.message : error);
        }
      } else {
        console.warn(" Could not get deployment transaction for verification");
      }
    }
    
    // Verify on block explorer if possible
    if (network.name !== 'hardhat' && network.name !== 'localhost') {
      console.log("\nTo verify the contract on Polygonscan, run:");
      console.log(`npx hardhat verify --network ${network.name} ${proxyAddress} ${ANC_TOKEN_ADDRESS}`);
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