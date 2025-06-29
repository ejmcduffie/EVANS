// Simple script to check deployer account and balance
const hre = require("hardhat");

async function main() {
  console.log("🔍 Checking deployer account...");
  
  try {
    // Get the default provider
    const provider = hre.ethers.provider;
    
    // Get network info
    const network = await provider.getNetwork();
    console.log(`\n🌐 Connected to: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    if (!deployer) {
      console.log("❌ No deployer account found");
      return;
    }
    
    console.log(`\n👤 Deployer address: ${deployer.address}`);
    
    // Get balance
    const balance = await provider.getBalance(deployer.address);
    console.log(`💰 Balance: ${hre.ethers.utils.formatEther(balance)} MATIC`);
    
    console.log("\n✅ Script completed successfully");
  } catch (error) {
    console.error("\n❌ Error:", error);
    console.log("\n💡 Make sure your .env file has the correct PRIVATE_KEY and RPC_URL");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Unhandled error:", error);
    process.exit(1);
  });
