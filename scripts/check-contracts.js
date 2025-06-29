// Script to check contract deployment status
const fs = require('fs');
const path = require('path');
const { ethers } = require("hardhat");

// List of contracts to check
const CONTRACTS = [
  'ANC',
  'ANCTokenDynamic',
  'MockAR',
  'SimpleStorage',
  'SimpleToken',
  'StorageManager',
  'TreasuryRouter'
];

async function main() {
  console.log("🔍 Checking contract deployment status...");
  
  try {
    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log(`\n🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deployer: ${deployer.address}`);
    
    // Check each contract
    console.log("\n📋 Contract Deployment Status:");
    console.log("-".repeat(60));
    
    for (const contractName of CONTRACTS) {
      try {
        const artifactPath = path.join(
          __dirname,
          '..',
          'artifacts',
          'contracts',
          `${contractName}.sol`,
          `${contractName}.json`
        );
        
        // Check if artifact exists
        if (!fs.existsSync(artifactPath)) {
          console.log(`\n❌ ${contractName}: Artifact not found`);
          continue;
        }
        
        console.log(`\n✅ ${contractName}: Artifact found`);
        
        // Try to get contract factory to check compilation
        try {
          const Contract = await ethers.getContractFactory(contractName);
          console.log(`   - Compiled successfully`);
          
          // Check if we have a deployment record
          const deploymentPath = path.join(
            __dirname,
            '..',
            'deployments',
            network.name,
            `${contractName}.json`
          );
          
          if (fs.existsSync(deploymentPath)) {
            const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
            console.log(`   - Deployment found at: ${deployment.address}`);
            
            // Check if contract is deployed
            const code = await ethers.provider.getCode(deployment.address);
            if (code !== '0x') {
              console.log(`   - ✅ Contract code verified on-chain`);
              console.log(`   - 📝 View on Polygonscan: https://amoy.polygonscan.com/address/${deployment.address}`);
            } else {
              console.log(`   - ❌ No code at address`);
            }
          } else {
            console.log(`   - ⚠️  No deployment record found`);
          }
          
        } catch (error) {
          console.log(`   - ❌ Error getting contract factory: ${error.message}`);
        }
        
      } catch (error) {
        console.log(`\n❌ Error checking ${contractName}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error("\n❌ Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Unhandled error:", error);
    process.exit(1);
  });
