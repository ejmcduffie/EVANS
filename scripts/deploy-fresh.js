// Simple deployment script for ANC token
async function main() {
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Check balance
  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance), "MATIC");
  
  if (balance.lt(ethers.utils.parseEther("0.01"))) {
    throw new Error("Insufficient balance. Get test MATIC from https://faucet.polygon.technology/");
  }
  
  // Deploy the contract
  console.log("Deploying ANC token...");
  const ANC = await ethers.getContractFactory("ANC");
  const anc = await ANC.deploy();
  
  console.log("Waiting for deployment...");
  await anc.deployed();
  
  console.log("ANC Token deployed to:", anc.address);
  console.log("Transaction hash:", anc.deployTransaction.hash);
  
  // Wait for 5 confirmations
  console.log("Waiting for confirmations...");
  await anc.deployTransaction.wait(5);
  
  console.log("\nTo verify on Polygonscan, run:");
  console.log(`npx hardhat verify --network amoy ${anc.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
