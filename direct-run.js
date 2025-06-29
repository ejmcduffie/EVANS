// Script to run Hardhat directly with environment variables
const { spawn } = require('child_process');
const path = require('path');

console.log("=== Direct Hardhat Execution Test ===\n");

const projectDir = path.join(__dirname, 'hh-test');
console.log(`Running in directory: ${projectDir}`);

// Set environment variables
const env = {
  ...process.env,
  // Force verbose output
  DEBUG: '*',
  HARDHAT_VERBOSE: 'true',
  // Disable color output for better log parsing
  FORCE_COLOR: '0',
  // Disable any progress bars
  CI: 'true',
  // Disable interactive prompts
  HARDHAT_DISABLE_INTERACTIVE: 'true'
};

console.log("Environment variables set:");
console.log(`- DEBUG: ${env.DEBUG}`);
console.log(`- HARDHAT_VERBOSE: ${env.HARDHAT_VERBOSE}`);
console.log(`- FORCE_COLOR: ${env.FORCE_COLOR}`);
console.log(`- CI: ${env.CI}`);
console.log(`- HARDHAT_DISABLE_INTERACTIVE: ${env.HARDHAT_DISABLE_INTERACTIVE}`);
console.log("");

console.log("Executing: npx hardhat --verbose run scripts/test-simple.js");
console.log("-".repeat(80));

const hardhat = spawn('npx', ['hardhat', '--verbose', 'run', 'scripts/test-simple.js'], {
  cwd: projectDir,
  env,
  stdio: 'pipe',
  shell: true
});

// Log all output
hardhat.stdout.on('data', (data) => {
  console.log(`[stdout] ${data.toString().trim()}`);
});

hardhat.stderr.on('data', (data) => {
  console.error(`[stderr] ${data.toString().trim()}`);
});

hardhat.on('close', (code) => {
  console.log("\n" + "-".repeat(80));
  console.log(`Process exited with code ${code}`);
});

// Set a timeout to prevent hanging
setTimeout(() => {
  console.error('\n=== Timeout reached, killing process ===');
  hardhat.kill('SIGTERM');
}, 15000);
