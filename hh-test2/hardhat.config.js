// Minimal Hardhat configuration
require("@nomicfoundation/hardhat-toolbox");

// Simple logging to verify config is loaded
console.log("=== Hardhat Config Loaded (hh-test2) ===");
console.log("Node version:", process.version);

module.exports = {
  solidity: "0.8.20",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

console.log("=== Hardhat Config Exported ===");
