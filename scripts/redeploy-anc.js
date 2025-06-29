const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");
  
  // Get the deployer's address
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()));

  // Deploy the contract
  console.log("\nDeploying ANC token...");
  const ANC = await hre.ethers.getContractFactory("ANC");
  const anc = await ANC.deploy();
  
  console.log("Waiting for deployment...");
  await anc.deployed();
  
  console.log("\nANC Token deployed to:", anc.address);
  console.log("Transaction hash:", anc.deployTransaction.hash);
  console.log("\nWaiting for 5 confirmations...");
  
  // Wait for 5 confirmations
  await anc.deployTransaction.wait(5);
  
  console.log("\nDeployment confirmed!");
  console.log("\nTo verify on Polygonscan, run:");
  console.log(`npx hardhat verify --network amoy ${anc.address}`);
  
  return anc.address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
