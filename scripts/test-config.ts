import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("Testing Hardhat configuration...");
  
  try {
    // Test network connection
    console.log("Testing network connection...");
    const provider = ethers.provider;
    const network = await provider.getNetwork();
    console.log("Connected to network:", {
      name: network.name,
      chainId: network.chainId,
      url: provider.connection?.url || "unknown"
    });

    // Get signers
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    
    // Get balance
    const balance = await provider.getBalance(deployer.address);
    console.log("Deployer balance:", ethers.formatEther(balance), "MATIC");
    
    console.log("Configuration test completed successfully!");
  } catch (error) {
    console.error("Configuration test failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
