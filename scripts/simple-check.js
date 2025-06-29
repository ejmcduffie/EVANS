const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking network and account...");
  
  // Get the default provider
  const provider = ethers.provider;
  
  // Get network info
  const network = await provider.getNetwork();
  console.log(`\n🌐 Connected to: ${network.name} (Chain ID: ${network.chainId})`);
  
  // Get accounts
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    console.log("❌ No deployer account found");
    return;
  }
  
  console.log(`\n👤 Using account: ${deployer.address}`);
  
  // Get balance
  const balance = await provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.utils.formatEther(balance)} MATIC`);
  
  console.log("\n✅ Script completed successfully");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
