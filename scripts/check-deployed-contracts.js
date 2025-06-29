// Script to check for deployed contracts from the deployer address
const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking for deployed contracts...");
  
  try {
    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log(`\n🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`\n👤 Deployer: ${deployer.address}`);
    
    // Get the transaction count for the deployer
    const txCount = await ethers.provider.getTransactionCount(deployer.address);
    console.log(`\n📊 Transaction count: ${txCount}`);
    
    if (txCount === 0) {
      console.log("\n❌ No transactions found from this address. No contracts have been deployed yet.");
      return;
    }
    
    console.log("\n🔍 Checking for contract deployments...");
    
    // Get the last 10 transactions to check for contract deployments
    const latestBlock = await ethers.provider.getBlockNumber();
    const startBlock = Math.max(0, latestBlock - 1000); // Check last 1000 blocks
    
    console.log(`\n🔍 Scanning blocks ${startBlock} to ${latestBlock} for contract deployments...`);
    
    let deploymentFound = false;
    
    // Check each transaction from the deployer
    for (let i = 0; i < txCount; i++) {
      const tx = await ethers.provider.getTransaction(await ethers.provider.getTransactionFromBlock(startBlock + i, 0));
      
      if (tx && tx.from.toLowerCase() === deployer.address.toLowerCase() && !tx.to) {
        // This is a contract deployment
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        if (receipt && receipt.contractAddress) {
          console.log(`\n✅ Found deployed contract at: ${receipt.contractAddress}`);
          console.log(`   - Block: ${receipt.blockNumber}`);
          console.log(`   - Transaction: ${receipt.transactionHash}`);
          console.log(`   - Gas used: ${receipt.gasUsed.toString()}`);
          
          // Try to get the contract code
          const code = await ethers.provider.getCode(receipt.contractAddress);
          if (code !== '0x') {
            console.log(`   - ✅ Contract code verified`);
          } else {
            console.log(`   - ❌ No code found at address`);
          }
          
          deploymentFound = true;
        }
      }
    }
    
    if (!deploymentFound) {
      console.log("\n❌ No contract deployments found from this address.");
      console.log("\n💡 To deploy a contract, use one of the deployment scripts in the scripts/ directory");
    }
    
  } catch (error) {
    console.error("\n❌ Error:", error);
    
    // Provide helpful error messages
    if (error.message.includes("missing provider")) {
      console.log("\n💡 Tip: Make sure your Hardhat config has the correct network settings");
    } else if (error.message.includes("invalid address")) {
      console.log("\n💡 Tip: Check your .env file for a valid PRIVATE_KEY");
    } else if (error.message.includes("rate")) {
      console.log("\n💡 Tip: Rate limited. Please try again in a moment");
    } else {
      console.log("\n💡 Tip: Check your internet connection and RPC URL in the .env file");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Unhandled error:", error);
    process.exit(1);
  });
