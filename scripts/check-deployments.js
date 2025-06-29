const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking contract deployments...");
  
  // Get the default provider
  const provider = ethers.provider;
  
  // Check if connected to a network
  const network = await provider.getNetwork();
  console.log(`\n🌐 Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`\n👤 Using deployer: ${deployer.address}`);
  
  // Get deployer balance
  const balance = await provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.utils.formatEther(balance)} MATIC`);
  
  // Check contract deployments (you'll need to add your contract addresses here)
  const contracts = [
    { name: 'ANC Token', address: '0x...' },
    // Add other contract addresses here
  ];
  
  console.log("\n📝 Contract Deployment Status:");
  console.log("-".repeat(50));
  
  for (const contract of contracts) {
    if (contract.address === '0x...') continue; // Skip if address not set
    
    try {
      const code = await provider.getCode(contract.address);
      const isDeployed = code !== '0x';
      console.log(`\n${contract.name} (${contract.address}):`);
      console.log(`   Status: ${isDeployed ? '✅ Deployed' : '❌ Not Deployed'}`);
      
      if (isDeployed) {
        console.log(`   Code size: ${(code.length - 2) / 2} bytes`);
      }
    } catch (error) {
      console.log(`\n${contract.name} (${contract.address}):`);
      console.log(`   ❌ Error checking contract: ${error.message}`);
    }
  }
  
  console.log("\n✅ Deployment check complete");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
