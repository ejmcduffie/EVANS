const { ethers } = require('ethers');
require('dotenv').config();

// ANCToken address on Polygon Amoy
const ANCTOKEN_ADDRESS = '0x2575C0616A1DE17E12CDe37f49355DeFea8E8c2b';

async function main() {
  console.log('Connecting to network...');
  
  // Set up provider and signer
  const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log('Connected to network. Wallet address:', wallet.address);
  
  // ABI for balanceOf function
  const abi = [
    'function balanceOf(address owner) view returns (uint256)'
  ];
  
  // Create contract instance
  console.log('Creating contract instance...');
  const ancToken = new ethers.Contract(ANCTOKEN_ADDRESS, abi, wallet);
  
  // Check balance
  console.log('Checking balance...');
  try {
    const balance = await ancToken.balanceOf(wallet.address);
    console.log(`\n✅ Account ${wallet.address} has ${ethers.formatEther(balance)} ANC tokens`);
  } catch (error) {
    console.error('❌ Error checking balance:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
