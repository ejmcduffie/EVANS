// Debug script to test Hardhat environment and configuration
import { ethers, run, network } from "hardhat";
import * as dotenv from 'dotenv';

async function main() {
  console.log("=== Hardhat Environment Debugger ===\n");
  
  try {
    // 1. Load environment variables
    console.log("[1/6] Loading environment variables...");
    dotenv.config({ path: '.env' });
    
    // 2. Check network configuration
    console.log("\n[2/6] Network Configuration:");
    console.log("- Network name:", network.name);
    console.log("- Chain ID:", network.config.chainId);
    
    // 3. Check provider connection
    console.log("\n[3/6] Provider Connection:");
    const provider = ethers.provider;
    try {
      const blockNumber = await provider.getBlockNumber();
      console.log("- Connected to network, latest block:", blockNumber);
      const networkInfo = await provider.getNetwork();
      console.log("- Network info:", {
        name: networkInfo.name,
        chainId: networkInfo.chainId,
        ensAddress: networkInfo.ensAddress || 'none'
      });
    } catch (error) {
      console.error("- ❌ Failed to connect to network:", error instanceof Error ? error.message : error);
    }
    
    // 4. Check signers
    console.log("\n[4/6] Available Signers:");
    const signers = await ethers.getSigners();
    console.log(`- Found ${signers.length} signer(s)`);
    if (signers.length > 0) {
      const signer = signers[0];
      console.log("- First signer address:", await signer.getAddress());
      console.log("- Balance:", ethers.formatEther(await provider.getBalance(signer.address)), "MATIC");
    }
    
    // 5. Check environment variables
    console.log("\n[5/6] Environment Variables:");
    console.log("- AMOY_RPC_URL:", process.env.AMOY_RPC_URL ? 'set' : 'not set');
    console.log("- PRIVATE_KEY:", process.env.PRIVATE_KEY ? 'set' : 'not set');
    console.log("- ANC_TOKEN_ADDRESS:", process.env.ANC_TOKEN_ADDRESS || 'not set');
    console.log("- POLYGONSCAN_API_KEY:", process.env.POLYGONSCAN_API_KEY ? 'set' : 'not set');
    
    // 6. Test contract compilation
    console.log("\n[6/6] Testing contract compilation...");
    try {
      await run("compile");
      console.log("- ✅ Contracts compiled successfully");
      
      // Try to get contract factory
      try {
        const StorageManager = await ethers.getContractFactory("StorageManager");
        console.log("- ✅ StorageManager contract found and compiled");
      } catch (error) {
        console.error("- ❌ Error getting StorageManager factory:", error instanceof Error ? error.message : error);
      }
    } catch (error) {
      console.error("- ❌ Compilation failed:", error instanceof Error ? error.message : error);
    }
    
    console.log("\n=== Debugging Complete ===");
    
  } catch (error) {
    console.error("\n=== Debugging Failed ===");
    console.error("Error:", error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error("\nStack trace:");
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
