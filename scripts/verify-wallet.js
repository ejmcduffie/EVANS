const { ethers } = require("ethers");

// Your provided details
const providedAddress = "0x148041C3df4f780A8E137Bb807ad1672215ed613";
const privateKey = "55ff269726c56531a5e201ef513247c23526342859e68fe1895d24a4925efc96";
const mnemonic = "awful aerobic basket ticket forum bachelor paddle light prison scatter exile crater";

async function main() {
  console.log("🔍 Verifying wallet details...");
  
  // 1. Check private key to address
  const walletFromPrivateKey = new ethers.Wallet(privateKey);
  console.log("\n🔑 From Private Key:");
  console.log("Address:", walletFromPrivateKey.address);
  console.log("Matches provided address:", walletFromPrivateKey.address.toLowerCase() === providedAddress.toLowerCase() ? "✅ Yes" : "❌ No");
  
  // 2. Check mnemonic to address
  const walletFromMnemonic = ethers.Wallet.fromMnemonic(mnemonic);
  console.log("\n📝 From Mnemonic:");
  console.log("Address:", walletFromMnemonic.address);
  console.log("Matches provided address:", walletFromMnemonic.address.toLowerCase() === providedAddress.toLowerCase() ? "✅ Yes" : "❌ No");
  
  // 3. Check balance on Amoy testnet
  console.log("\n🌐 Checking balance on Amoy testnet...");
  const provider = new ethers.providers.JsonRpcProvider("https://rpc-amoy.polygon.technology/");
  const balance = await provider.getBalance(providedAddress);
  const balanceInMatic = ethers.utils.formatEther(balance);
  
  console.log("\n💰 Balance on Amoy:");
  console.log("Address:", providedAddress);
  console.log("Balance:", balanceInMatic, "MATIC");
  
  if (balance.lt(ethers.utils.parseEther("0.1"))) {
    console.log("\n⚠️  Low balance! Please get test MATIC from:");
    console.log("https://faucet.polygon.technology/");
    console.log("1. Select 'Amoy' network");
    console.log("2. Paste your address:", providedAddress);
    console.log("3. Click 'Submit'");
  } else {
    console.log("\n✅ You have enough MATIC for deployment!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  });
