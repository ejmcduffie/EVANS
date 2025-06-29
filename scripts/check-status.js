// Simple script to check deployment status
const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking deployment status...");
  
  try {
    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log(`\n🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`\n👤 Deployer: ${deployer.address}`);
    
    // Get balance
    const balance = await deployer.getBalance();
    console.log(`💰 Balance: ${ethers.utils.formatEther(balance)} MATIC`);
    
    console.log("\n✅ Script completed successfully");
    
  } catch (error) {
    console.error("\n❌ Error:", error);
    
    // Common issues and solutions
    if (error.message.includes("missing provider")) {
      console.log("\n💡 Tip: Make sure your Hardhat config has the correct network settings");
    } else if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Tip: Your account balance is too low. Get test MATIC from https://faucet.polygon.technology/");
    } else if (error.message.includes("invalid address")) {
      console.log("\n💡 Tip: Check your .env file for a valid PRIVATE_KEY");
    } else {
      console.log("\n💡 Tip: Check your Hardhat configuration and network settings");
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
