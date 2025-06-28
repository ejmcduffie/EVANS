import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

// Mock price feed addresses for local testing
// These will be deployed as mock aggregators
const MOCK_PRICES = {
  ANC_USD: 100000000, // $100.00 (8 decimals)
  AR_USD: 5000000,    // $5.00 (8 decimals)
  LINK_USD: 1500000000 // $15.00 (8 decimals)
};

async function deployMockAggregator(deployer: any, initialAnswer: number) {
  const MockAggregator = await ethers.getContractFactory("MockV3Aggregator", {
    libraries: {},
  });
  const mockAggregator = await MockAggregator.deploy(8, initialAnswer);
  await mockAggregator.waitForDeployment();
  return mockAggregator;
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy MockAR token
  console.log("Deploying MockAR token...");
  const MockAR = await ethers.getContractFactory("MockAR");
  const mockAR = await MockAR.deploy();
  await mockAR.waitForDeployment();
  console.log("MockAR deployed to:", await mockAR.getAddress());

  // Deploy mock price feeds
  console.log("\nDeploying mock price feeds...");
  const ancUsdFeed = await deployMockAggregator(deployer, MOCK_PRICES.ANC_USD);
  const arUsdFeed = await deployMockAggregator(deployer, MOCK_PRICES.AR_USD);
  const linkUsdFeed = await deployMockAggregator(deployer, MOCK_PRICES.LINK_USD);

  console.log("\nPrice Feeds:");
  console.log("ANC/USD:", await ancUsdFeed.getAddress());
  console.log("AR/USD: ", await arUsdFeed.getAddress());
  console.log("LINK/USD:", await linkUsdFeed.getAddress());

  // Deploy TreasuryRouter
  console.log("\nDeploying TreasuryRouter...");
  const TreasuryRouter = await ethers.getContractFactory("TreasuryRouter");
  const treasuryRouter = await TreasuryRouter.deploy(
    process.env.ANC_TOKEN || deployer.address, // Use existing ANC token or deployer as mock
    await mockAR.getAddress(),
    "0x326C977E6efc84E512bB9C30f76E30c160eD06FB", // LINK token on Amoy
    await ancUsdFeed.getAddress(),
    await arUsdFeed.getAddress(),
    await linkUsdFeed.getAddress()
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
