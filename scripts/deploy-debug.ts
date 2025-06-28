import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("Starting deployment process...");
  
  try {
    // Get signer
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    
    // Get balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance:", ethers.formatEther(balance), "MATIC");
    
    // Deploy ANC token
    console.log("Deploying ANC token...");
    const ANC = await ethers.getContractFactory("ANC");
    const anc = await ANC.deploy();
    await anc.waitForDeployment();
    console.log("ANC deployed to:", await anc.getAddress());
    
    console.log("Deployment completed successfully!");
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
