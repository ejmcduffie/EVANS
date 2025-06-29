const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Starting deployment with specific wallet...");
  
  // Your wallet details
  const privateKey = "55ff269726c56531a5e201ef513247c23526342859e68fe1895d24a4925efc96";
  const walletAddress = "0x148041C3df4f780A8E137Bb807ad1672215ed613";
  
  // Connect to the network
  const provider = new ethers.providers.JsonRpcProvider("https://rpc-amoy.polygon.technology/");
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log("\n🔑 Wallet Details:");
  console.log("Address:", wallet.address);
  console.log("Matches provided:", wallet.address.toLowerCase() === walletAddress.toLowerCase() ? "✅ Yes" : "❌ No");
  
  // Check balance
  const balance = await wallet.getBalance();
  console.log("\n💰 Balance:", ethers.utils.formatEther(balance), "MATIC");
  
  if (balance.lt(ethers.utils.parseEther("0.1"))) {
    throw new Error("❌ Insufficient balance. Get test MATIC from https://faucet.polygon.technology/");
  }
  
  console.log("\n📦 Deploying ANC token...");
  
  // Deploy the contract
  const ANC = await ethers.getContractFactory("ANC", wallet);
  console.log("✅ Contract factory created");
  
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
  
  // Verify contract code
  const code = await provider.getCode(anc.address);
  console.log("\n🔍 Contract code deployed:", code !== '0x' ? "✅ Yes" : "❌ No");
  
  console.log("\n📝 To verify on Polygonscan, run:");
  console.log(`npx hardhat verify --network amoy ${anc.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  });
