// Test script to check console output behavior

// Test 1: Basic console.log
console.log("1. Basic console.log");

// Test 2: Write directly to process.stdout
process.stdout.write("2. process.stdout.write\n");

// Test 3: Write to stderr
console.error("3. console.error");

// Test 4: Write to stdout with process.stdout
process.stdout.write("4. process.stdout.write with callback\n", 'utf8', () => {
  console.log("5. Callback from process.stdout.write");
});

// Test 5: Async operation
setTimeout(() => {
  console.log("6. Async console.log after timeout");
}, 1000);

// Test 6: Uncaught exception
// setTimeout(() => {
//   throw new Error("Test uncaught exception");
// }, 2000);

console.log("7. End of script");
