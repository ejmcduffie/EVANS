import { ethers } from "hardhat";

async function main() {
  console.log("=== Checking Hardhat Configuration ===\n");
  
  try {
    // 1. Get network info
    const network = await ethers.provider.getNetwork();
    console.log("[1/4] Network:", network.name, "(Chain ID:", network.chainId + ")");
    
    // 2. Get deployer info
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    console.log("[2/4] Deployer address:", deployerAddress);
    
    // 3. Get balance
    const balance = await ethers.provider.getBalance(deployerAddress);
    console.log("[3/4] Deployer balance:", ethers.formatEther(balance), "MATIC");
    
    // 4. Check environment variables
    console.log("\n[4/4] Environment Variables:");
    console.log("- AMOY_RPC_URL:", process.env.AMOY_RPC_URL ? "[SET]" : "[NOT SET]");
    console.log("- PRIVATE_KEY:", process.env.PRIVATE_KEY ? "[SET]" : "[NOT SET]");
    console.log("- ANC_TOKEN_ADDRESS:", process.env.ANC_TOKEN_ADDRESS || "[NOT SET]");
    
    console.log("\n=== Configuration Check Complete ===");
    
  } catch (error) {
    console.error("\n=== Configuration Check Failed ===");
    if (error instanceof Error) {
      console.error("Error:", error.message);
      if (error.stack) {
        console.error("\nStack trace:");
        console.error(error.stack);
      }
    } else {
      console.error("Unknown error:", error);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
