// Minimal Hardhat configuration for testing
console.log("=== Hardhat Config Loading ===");
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

console.log("=== Hardhat Config Loaded ===");
