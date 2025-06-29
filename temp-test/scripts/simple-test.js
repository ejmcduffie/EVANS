// Minimal Hardhat test script
console.log("=== Starting Simple Test ===");

// Test basic console output
console.log("1. Basic console output works");

// Test require
const hre = require("hardhat");
console.log("2. Hardhat require works");

// Test async/await
async function test() {
  try {
    console.log("3. Testing async/await...");
    const accounts = await hre.ethers.getSigners();
    console.log("4. Got", accounts.length, "accounts");
    if (accounts.length > 0) {
      console.log("5. First account:", await accounts[0].getAddress());
    }
  } catch (error) {
    console.error("Error in test:", error);
  }
}

test().then(() => {
  console.log("=== Test completed ===");
}).catch(error => {
  console.error("Test failed:", error);
});
