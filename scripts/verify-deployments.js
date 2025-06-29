// Script to verify contract deployments
const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Verifying contract deployments...");
  
  try {
    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log(`\n🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deployer: ${deployer.address}`);
    
    // Get deployer balance
    const balance = await deployer.getBalance();
    console.log(`💰 Balance: ${ethers.utils.formatEther(balance)} MATIC`);
    
    // List of contracts to check
    const contracts = [
      'ANC',
      'ANCTokenDynamic',
      'MockAR',
      'SimpleStorage',
      'SimpleToken',
      'StorageManager',
      'TreasuryRouter'
    ];
    
    console.log("\n📋 Contract Deployment Status:");
    console.log("-".repeat(60));
    
    for (const contractName of contracts) {
      try {
        console.log(`\n🔍 ${contractName}:`);
        
        // Try to get contract factory to check compilation
        const Contract = await ethers.getContractFactory(contractName);
        console.log(`   - ✅ Compiled successfully`);
        
        // Check if contract has been deployed (this would need actual deployment addresses)
        console.log(`   - ℹ️  No deployment address provided`);
        console.log(`   - 📝 To deploy, run: npx hardhat run scripts/deploy-${contractName.toLowerCase()}.js --network amoy`);
        
      } catch (error) {
        console.log(`\n❌ Error checking ${contractName}:`);
        console.log(`   - ${error.message}`);
      }
    }
    
    console.log("\n✅ Verification complete");
    console.log("\n💡 To deploy a contract, use one of the deployment scripts in the scripts/ directory");
    
  } catch (error) {
    console.error("\n❌ Error:", error);
    console.log("\n💡 Make sure your .env file is properly configured with PRIVATE_KEY and RPC_URL");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Unhandled error:", error);
    process.exit(1);
  });
