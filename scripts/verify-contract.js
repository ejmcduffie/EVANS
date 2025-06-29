const { ethers } = require("hardhat");

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.AMOY_RPC_URL);
  const address = "0x2575C0616A1DE17E12CDe37f49355DeFea8E8c2b";
  
  try {
    const code = await provider.getCode(address);
    console.log(`Contract at ${address}:`);
    console.log(code === '0x' ? 'No code at this address' : 'Contract code exists');
    
    if (code !== '0x') {
      console.log('Code length:', code.length);
      // Check transaction count to see if it's a contract
      const txCount = await provider.getTransactionCount(address);
      console.log('Transaction count:', txCount);
    }
    
    // Check if it's a contract by trying to get storage (will fail for EOA)
    try {
      const storage = await provider.getStorageAt(address, 0);
      console.log('First storage slot:', storage);
    } catch (e) {
      console.log('Could not read storage (may be an EOA)');
    }
    
  } catch (error) {
    console.error('Error checking contract:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
