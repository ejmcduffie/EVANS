import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

// -----------------------------------------------------------------------------
// Hybrid deployment configuration (Polygon Amoy)
// -----------------------------------------------------------------------------
// • ANC/USD and AR/USD use mock Chainlink aggregators with static prices
// • LINK/USD uses the live Chainlink feed on Amoy
// -----------------------------------------------------------------------------
const MOCK_PRICES = {
  ANC_USD: 100_000000, // $100.00 (8 decimals)
  AR_USD: 5_000000,    // $5.00 (8 decimals)
};

const REAL_LINK_USD_FEED = "0x1C2252aeeD50e0c9B64bDfF2735Ee3C932F5C408"; // Amoy LINK/USD

async function deployMockAggregator(deployer: any, initialAnswer: number) {
  const MockAggregator = await ethers.getContractFactory("MockV3Aggregator", {
    libraries: {},
  });
  const mockAggregator = await MockAggregator.deploy(8, initialAnswer);
  await mockAggregator.waitForDeployment();
  return mockAggregator;
}

async function main() {
  console.log("Starting deployment process...");
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider?.getBalance(deployer.address))?.toString() || "N/A");

    // -------------------------------------------------------------------------
  // 1. Deploy ANCTokenDynamic (or use existing address from .env)
  // -------------------------------------------------------------------------
  let ancTokenAddress: string;
  if (process.env.ANC_TOKEN && process.env.ANC_TOKEN !== "") {
    ancTokenAddress = process.env.ANC_TOKEN;
    console.log("Using existing ANCTokenDynamic:", ancTokenAddress);
  } else {
    console.log("Deploying ANCTokenDynamic...");
    const ANCTokenDynamic = await ethers.getContractFactory("ANCTokenDynamic");
    
    // Deployer will be the initial owner and treasury
    const deployerAddress = await deployer.getAddress();
    
    // Using MATIC/USD price feed on Amoy testnet
    const maticUsdFeed = "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada";
    
    // Target price of $100 per ANC (8 decimals)
    const targetUsdPrice = 100 * 10 ** 8;
    
    const ancToken = await ANCTokenDynamic.deploy(
      deployerAddress,  // treasury address
      maticUsdFeed,     // MATIC/USD price feed
      targetUsdPrice    // $100 per ANC (8 decimals)
    );
    
    await ancToken.waitForDeployment();
    ancTokenAddress = await ancToken.getAddress();
    
    console.log("ANCTokenDynamic deployed to:", ancTokenAddress);
    console.log("• Treasury:", deployerAddress);
    console.log("• Target Price: $", targetUsdPrice / 1e8, "per ANC");
  }

  // -------------------------------------------------------------------------
  // 2. Deploy MockAR token
  // -------------------------------------------------------------------------
  console.log("Deploying MockAR token...");
  const MockAR = await ethers.getContractFactory("MockAR");
  const mockAR = await MockAR.deploy();
  await mockAR.waitForDeployment();
  console.log("MockAR deployed to:", await mockAR.getAddress());

  // -------------------------------------------------------------------------
  // 3. Deploy mock price feeds (ANC/USD & AR/USD)
  // -------------------------------------------------------------------------
  console.log("\nDeploying mock price feeds (ANC/USD & AR/USD)...");
  const ancUsdFeed = await deployMockAggregator(deployer, MOCK_PRICES.ANC_USD);
  const arUsdFeed = await deployMockAggregator(deployer, MOCK_PRICES.AR_USD);

  console.log("\nPrice Feeds:");
  console.log("ANC/USD:", await ancUsdFeed.getAddress());
  console.log("AR/USD: ", await arUsdFeed.getAddress());
  console.log("LINK/USD (real):", REAL_LINK_USD_FEED);

  // Deploy TreasuryRouter
  console.log("\nDeploying TreasuryRouter...");
  const TreasuryRouter = await ethers.getContractFactory("TreasuryRouter");
    const treasuryRouter = await TreasuryRouter.deploy(
    ancTokenAddress,
    await mockAR.getAddress(),
    "0x326C977E6efc84E512bB9C30f76E30c160eD06FB", // LINK token on Amoy
    await ancUsdFeed.getAddress(),
    await arUsdFeed.getAddress(),
    REAL_LINK_USD_FEED
  );
  await treasuryRouter.waitForDeployment();

  console.log("\nTreasuryRouter deployed to:", await treasuryRouter.getAddress());
  console.log("\nDeployment complete!");
  console.log("\nNext steps:");
  console.log("1. Verify contracts on Polygonscan");
  console.log("2. Update frontend with new contract addresses");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
