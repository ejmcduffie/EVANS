console.log("⏳  check-balance.js starting…");
const hre = require("hardhat");

async function main() {
  const signers = await hre.ethers.getSigners();
  console.log("Signers found:", signers.length);
  if (signers.length === 0) {
    console.error("❌  No accounts configured – check .env PRIVATE_KEY");
    process.exit(1);
  }
  const [acc] = signers;
  const balance = await acc.getBalance();
  console.log("Deployer :", acc.address);
  console.log("Balance  :", hre.ethers.utils.formatEther(balance), "MATIC");
}

// THIS must be present
main()
  .then(() => process.exit(0))
  .catch(err => { console.error(err); process.exit(1); });