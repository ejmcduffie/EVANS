import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

/**
 * Deploys ANCTokenDynamic with constructor parameters pulled from the .env.
 *
 * Required .env variables:
 *   TREASURY_ADDRESS            - Address to receive MATIC proceeds
 *   MATIC_USD_FEED              - Chainlink MATIC / USD Aggregator address (8 decimals)
 *   ANC_TARGET_USD_PRICE_8DEC   - Target USD price per ANC (8-decimals)
 */
async function main() {
  // ------------------------------------------------------------------
  // Read environment inputs
  // ------------------------------------------------------------------
  const treasury = process.env.TREASURY_ADDRESS ?? "";
  const maticUsdFeed = process.env.MATIC_USD_FEED ?? "";
  const targetUsdPriceStr = process.env.ANC_TARGET_USD_PRICE_8DEC ?? "";

  if (!ethers.isAddress(treasury)) throw new Error("Invalid TREASURY_ADDRESS");
  if (!ethers.isAddress(maticUsdFeed)) throw new Error("Invalid MATIC_USD_FEED");
  if (!targetUsdPriceStr || !/^[0-9]+$/.test(targetUsdPriceStr)) {
    throw new Error("ANC_TARGET_USD_PRICE_8DEC must be an integer string");
  }
  const targetUsdPrice = BigInt(targetUsdPriceStr);

  // ------------------------------------------------------------------
  // Deploy
  // ------------------------------------------------------------------
  console.log("Starting ANCTokenDynamic deployment...");
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Treasury        :", treasury);
  console.log("MATIC/USD feed  :", maticUsdFeed);
  console.log("Target price    :", targetUsdPrice.toString(), "(8-dec)");

  const Factory = await ethers.getContractFactory("ANCTokenDynamic");
  const contract = await Factory.deploy(treasury, maticUsdFeed, targetUsdPrice);
  await contract.waitForDeployment();

  const addr = await contract.getAddress();
  console.log("ANCTokenDynamic deployed to:", addr);

  console.log("\nVerify with:");
  console.log(`npx hardhat verify --network amoy ${addr} ${treasury} ${maticUsdFeed} ${targetUsdPrice}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
