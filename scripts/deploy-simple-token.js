const hre = require("hardhat");
require('dotenv').config();

async function main() {
  console.log("Starting SimpleToken deployment...");
  
  try {
    // Get the deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    
    // Get the balance
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.utils.formatEther(balance), "MATIC");
    
    if (balance.eq(0)) {
      throw new Error("Account has no MATIC. Get test MATIC from the faucet first.");
    }
    
    // Deploy SimpleToken
    console.log("\nDeploying SimpleToken...");
    const SimpleToken = await hre.ethers.getContractFactory("SimpleToken");
    console.log("Deploying contract...");
    
    const simpleToken = await SimpleToken.deploy();
    console.log("Waiting for deployment transaction...");
    
    const tx = await simpleToken.deployed();
    console.log("Deployment transaction hash:", tx.deployTransaction.hash);
    
    console.log("Waiting for transaction to be mined...");
    const receipt = await tx.deployTransaction.wait();
    
    console.log("\n✅ SimpleToken deployed to:", simpleToken.address);
    console.log("Block number:", receipt.blockNumber);
    
    // Verify the contract
    console.log("\nTo verify the contract on Polygonscan, run:");
    console.log(`npx hardhat verify --network amoy ${simpleToken.address}`);
    
    return simpleToken.address;
    
  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.log("\n⚠️  Not enough MATIC for gas. Get test MATIC from the faucet:");
      console.log("https://faucet.polygon.technology/");
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
