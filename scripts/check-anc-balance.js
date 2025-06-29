const { ethers } = require('ethers');
const { CONTRACT_ADDRESSES, DEFAULT_CHAIN_ID } = require('../src/contracts/contracts.js');
require('dotenv').config();

async function main() {
  // Set up provider and signer
  const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  // ABI for balanceOf function
  const abi = [
    'function balanceOf(address owner) view returns (uint256)'
  ];
  
  // Create contract instance
  const ancToken = new ethers.Contract(
    CONTRACT_ADDRESSES.ANCToken[DEFAULT_CHAIN_ID],
    abi,
    wallet
  );
  
  // Check balance
  const balance = await ancToken.balanceOf(wallet.address);
  console.log(`Account ${wallet.address} has ${ethers.formatEther(balance)} ANC tokens`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
