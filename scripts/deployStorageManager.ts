require('@openzeppelin/hardhat-upgrades');
import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const ANC_TOKEN_ADDRESS = process.env.ANC_TOKEN_ADDRESS || "";
  if (!ANC_TOKEN_ADDRESS) {
    throw new Error("Please set ANC_TOKEN_ADDRESS in your environment variables or update the script.");
  }

  const StorageManager = await ethers.getContractFactory("StorageManager");
  const storageManager = await hre.upgrades.deployProxy(StorageManager, [ANC_TOKEN_ADDRESS], {
    initializer: "initialize",
  });

  await storageManager.waitForDeployment();
  console.log("StorageManager deployed to:", await storageManager.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});