const { ethers } = require("ethers");
require('dotenv').config();

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.AMOY_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const balance = await wallet.getBalance();
  console.log("Account:", wallet.address);
  console.log("Balance:", ethers.utils.formatEther(balance), "MATIC");
  
  if (balance.lt(ethers.utils.parseEther("0.1"))) {
    console.log("\n⚠️  Low balance! Get test MATIC from the faucet:");
    console.log("https://faucet.polygon.technology/");
    console.log("1. Select 'Amoy' network");
    console.log("2. Paste this address:", wallet.address);
    console.log("3. Click 'Submit' and wait for the transaction to complete");
    console.log("4. Try deploying again");
  } else {
    console.log("\n✅ You have enough MATIC to deploy contracts!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
