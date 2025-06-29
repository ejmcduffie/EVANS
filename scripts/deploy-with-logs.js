// Deployment script with detailed logging
async function main() {
  console.log("Starting deployment process...");
  
  try {
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("\n🔍 Account Details:");
    console.log("Deployer address:", deployer.address);
    
    // Check balance
    const balance = await deployer.getBalance();
    console.log("Balance:", ethers.utils.formatEther(balance), "MATIC");
    
    if (balance.lt(ethers.utils.parseEther("0.01"))) {
      throw new Error("❌ Insufficient balance. Get test MATIC from https://faucet.polygon.technology/");
    }
    
    console.log("\n📦 Deploying ANC token...");
    
    // Get contract factory
    const ANC = await ethers.getContractFactory("ANC");
    console.log("✅ Contract factory created");
    
    // Deploy the contract
    console.log("\n🚀 Deploying contract...");
    const anc = await ANC.deploy();
    console.log("✅ Deployment transaction sent");
    console.log("Transaction hash:", anc.deployTransaction.hash);
    
    console.log("\n⏳ Waiting for deployment to be mined...");
    await anc.deployed();
    
    console.log("\n🎉 Deployment successful!");
    console.log("Contract address:", anc.address);
    
    // Wait for 5 confirmations
    console.log("\n⏳ Waiting for 5 confirmations...");
    await anc.deployTransaction.wait(5);
    console.log("✅ 5 confirmations received");
    
    console.log("\n🔍 Verifying contract code on blockchain...");
    const code = await ethers.provider.getCode(anc.address);
    if (code === '0x') {
      console.log("❌ No code found at contract address!");
    } else {
      console.log("✅ Contract code verified on blockchain");
    }
    
    console.log("\n📝 To verify on Polygonscan, run:");
    console.log(`npx hardhat verify --network amoy ${anc.address}`);
    
  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
    if (error.transaction) {
      console.error("Transaction hash:", error.transaction.hash);
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
