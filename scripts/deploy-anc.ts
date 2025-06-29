import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("Starting ANC token deployment...");
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider?.getBalance(deployer.address))?.toString() || "N/A");

  // Deploy ANC token
  console.log("Deploying ANC token...");
  const ANC = await ethers.getContractFactory("ANC");
  const anc = await ANC.deploy();
  await anc.waitForDeployment();
  
  const ancAddress = await anc.getAddress();
  console.log(`ANC token deployed to: ${ancAddress}`);
  
  // Verify the contract
  console.log("\nTo verify the contract on Polygonscan, run:");
  console.log(`npx hardhat verify --network amoy ${ancAddress}`);
  
  return ancAddress;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
