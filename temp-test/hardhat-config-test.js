// Minimal Hardhat config for testing
require("@nomicfoundation/hardhat-toolbox");

// Simple logging to verify config is loaded
console.log("=== Hardhat Config Loaded ===");
console.log("Node version:", process.version);
console.log("Current directory:", process.cwd());

module.exports = {
  solidity: "0.8.20",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

console.log("=== Hardhat Config Exported ===");
