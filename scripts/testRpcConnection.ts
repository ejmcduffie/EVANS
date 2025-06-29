import { ethers } from "ethers";

async function main() {
  console.log("=== Testing RPC Connection ===\n");
  
  try {
    // Connect to the RPC URL from environment variables
    const rpcUrl = process.env.AMOY_RPC_URL;
    if (!rpcUrl) {
      throw new Error("AMOY_RPC_URL is not set in .env file");
    }
    
    console.log("[1/3] Connecting to RPC:", rpcUrl);
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Get network info
    console.log("[2/3] Fetching network information...");
    const network = await provider.getNetwork();
    console.log("  - Network name:", network.name);
    console.log("  - Chain ID:", network.chainId);
    console.log("  - ENS Address:", network.ensAddress || "Not set");
    
    // Get latest block
    console.log("[3/3] Fetching latest block...");
    const blockNumber = await provider.getBlockNumber();
    console.log("  - Latest block number:", blockNumber);
    
    console.log("\n=== RPC Connection Test Successful ===");
    
  } catch (error) {
    console.error("\n=== RPC Connection Test Failed ===");
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
