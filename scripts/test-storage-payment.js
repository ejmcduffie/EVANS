const { ethers } = require('ethers');
require('dotenv').config();

// Contract addresses
const STORAGE_MANAGER_ADDRESS = '0x4e4A19274C5EcFEAd6b621a52348f3E96508e2F6';
const ANCTOKEN_ADDRESS = '0x2575C0616A1DE17E12CDe37f49355DeFea8E8c2b';

// Test file hash and amount (in ANC, will be converted to wei)
const TEST_FILE_HASH = 'test-file-hash-123';
const TEST_AMOUNT = '10'; // 10 ANC

// StorageManager ABI (simplified with just the functions we need)
const STORAGE_MANAGER_ABI = [
  'function payForStorage(bytes32 fileHash, uint256 amount) external',
  'function totalPaidANC(bytes32 fileHash) external view returns (uint256)',
  'function userPaidANC(address user, bytes32 fileHash) external view returns (uint256)',
  'function totalSpent() external view returns (uint256)',
  'function ancToken() external view returns (address)',
  'function owner() external view returns (address)'
];

// ANCToken ABI (simplified)
const ANCTOKEN_ABI = [
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)'
];

// Helper function to log detailed error information
function logError(error, context = '') {
  console.error(`\n❌ ${context} Error:`, error.message);
  if (error.code) console.error(`   - Code: ${error.code}`);
  if (error.reason) console.error(`   - Reason: ${error.reason}`);
  if (error.method) console.error(`   - Method: ${error.method}`);
  if (error.transaction) console.error(`   - Transaction: ${JSON.stringify(error.transaction, null, 2)}`);
  if (error.receipt) console.error(`   - Receipt: ${JSON.stringify(error.receipt, null, 2)}`);
  console.error('\nStack trace:', error.stack);
}

async function main() {
  console.log('🚀 Starting StorageManager payment test...\n');
  
  let provider, wallet, ancToken, storageManager;
  
  try {
    // Validate environment
    if (!process.env.AMOY_RPC_URL) throw new Error('AMOY_RPC_URL is not set in .env');
    if (!process.env.PRIVATE_KEY) throw new Error('PRIVATE_KEY is not set in .env');
    
    console.log('🔗 Connecting to network...');
    provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);
    
    // Test connection
    const network = await provider.getNetwork();
    console.log(`🌐 Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
    
    wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log(`🔑 Using wallet: ${wallet.address}`);
    
    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Wallet balance: ${ethers.formatEther(balance)} MATIC\n`);
    
    // Create contract instances with error handling
    console.log('📄 Creating contract instances...');
  
    // Create ANCToken contract instance
    console.log(`\n🔍 Initializing ANCToken contract at ${ANCTOKEN_ADDRESS}...`);
    ancToken = new ethers.Contract(ANCTOKEN_ADDRESS, ANCTOKEN_ABI, wallet);
    
    // Test basic ANCToken functionality
    console.log('   - Testing ANCToken contract...');
    try {
      const [symbol, name, decimals, totalSupply] = await Promise.all([
        ancToken.symbol().catch(() => 'unknown'),
        ancToken.name().catch(() => 'unknown'),
        ancToken.decimals().catch(() => 'unknown'),
        ancToken.totalSupply().then(s => ethers.formatEther(s)).catch(() => 'unknown')
      ]);
      
      console.log('✅ ANCToken contract initialized successfully');
      console.log(`   - Symbol: ${symbol}`);
      console.log(`   - Name: ${name}`);
      console.log(`   - Decimals: ${decimals}`);
      console.log(`   - Total Supply: ${totalSupply} ANC`);
      
      // Check allowance for StorageManager
      const allowance = await ancToken.allowance(wallet.address, STORAGE_MANAGER_ADDRESS);
      console.log(`   - Current allowance for StorageManager: ${ethers.formatEther(allowance)} ANC`);
      
    } catch (error) {
      logError(error, 'Failed to interact with ANCToken contract');
      throw error;
    }
    
    // Create StorageManager contract instance
    console.log(`\n🔍 Initializing StorageManager contract at ${STORAGE_MANAGER_ADDRESS}...`);
    storageManager = new ethers.Contract(STORAGE_MANAGER_ADDRESS, STORAGE_MANAGER_ABI, wallet);
    
    // Test basic StorageManager functionality
    console.log('   - Testing StorageManager contract...');
    try {
      const [owner, ancTokenAddr, totalSpent] = await Promise.all([
        storageManager.owner().catch(() => 'unknown'),
        storageManager.ancToken().catch(() => 'unknown'),
        storageManager.totalSpent().then(s => ethers.formatEther(s)).catch(() => 'unknown')
      ]);
      
      console.log('✅ StorageManager contract initialized successfully');
      console.log(`   - Owner: ${owner}`);
      console.log(`   - ANC Token: ${ancTokenAddr}`);
      console.log(`   - Total ANC spent: ${totalSpent} ANC`);
      
      // Verify owner matches our wallet
      if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
        console.warn('⚠️  Warning: Connected wallet is not the owner of the StorageManager contract');
      }
      
    } catch (error) {
      logError(error, 'Failed to interact with StorageManager contract');
      throw error;
    }
  
    // Helper function to log balances
    const logBalances = async () => {
      try {
        // Get file hash
        const fileHashBytes = ethers.keccak256(ethers.toUtf8Bytes(TEST_FILE_HASH));
        console.log(`   - File hash (bytes32): ${fileHashBytes}`);
        
        // Get storage stats
        const [ancBalance, totalPaid, userPaid, totalSpent, ancTokenAddress] = await Promise.all([
          ancToken.balanceOf(wallet.address).catch(() => 0),
          storageManager.totalPaidANC(fileHashBytes).catch(() => 0),
          storageManager.userPaidANC(wallet.address, fileHashBytes).catch(() => 0),
          storageManager.totalSpent().catch(() => 0),
          storageManager.ancToken().catch(() => 'unknown')
        ]);
        
        console.log('📊 Account & Storage Stats:');
        console.log(`   - Your ANC Balance: ${ethers.formatEther(ancBalance)} ANC`);
        console.log(`   - Total Paid for File: ${ethers.formatEther(totalPaid)} ANC`);
        console.log(`   - You Paid for File: ${ethers.formatEther(userPaid)} ANC`);
        console.log(`   - Total Spent (all files): ${ethers.formatEther(totalSpent)} ANC`);
        console.log(`   - ANC Token: ${ancTokenAddress}`);
        
        return { ancBalance, totalPaid, userPaid, totalSpent, ancTokenAddress };
      } catch (error) {
        logError(error, 'Failed to get balances and stats');
        throw error;
      }
    };
    
    // Check initial balances and stats
    console.log('\n📝 Initial state:');
    await logBalances();
  
    // Check and approve if needed
    const amountWei = ethers.parseUnits(TEST_AMOUNT, 18);
    const allowance = await ancToken.allowance(wallet.address, STORAGE_MANAGER_ADDRESS);
    
    if (allowance < amountWei) {
      console.log('⏳ Approving ANC tokens for spending...');
      const approveTx = await ancToken.approve(STORAGE_MANAGER_ADDRESS, amountWei);
      await approveTx.wait();
      console.log('✅ Approval confirmed!\n');
    }
  
    // Make the payment
    console.log(`\n💸 Paying ${TEST_AMOUNT} ANC for file storage...`);
    try {
      const fileHashBytes = ethers.keccak256(ethers.toUtf8Bytes(TEST_FILE_HASH));
      console.log(`   - File hash: ${TEST_FILE_HASH}`);
      console.log(`   - Amount: ${ethers.formatEther(amountWei)} ANC`);
      
      const tx = await storageManager.payForStorage(fileHashBytes, amountWei);
      console.log(`⏳ Transaction hash: ${tx.hash}`);
      console.log('Waiting for confirmation...');
      
      const receipt = await tx.wait();
      console.log(`✅ Payment confirmed in block ${receipt.blockNumber}`);
      console.log(`   - Gas used: ${receipt.gasUsed.toString()}`);
      console.log(`   - Status: ${receipt.status === 1 ? 'Success' : 'Failed'}\n`);
      
      // Check final balances and stats
      console.log('📝 Final state:');
      await logBalances();
      
      return { success: true, receipt };
    } catch (error) {
      logError(error, 'Transaction failed');
      return { success: false, error };
    }
  } catch (error) {
    logError(error, 'Script execution failed');
    throw error;
  }
}

// Execute main function
main()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    logError(error, 'Script execution failed');
    process.exit(1);
  });
