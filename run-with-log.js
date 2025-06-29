// Script to run Hardhat with captured output
const { spawn } = require('child_process');
const path = require('path');

console.log("=== Starting Hardhat with captured output ===\n");

const projectDir = path.join(__dirname, 'hh-test');
console.log(`Running in directory: ${projectDir}`);

const hardhat = spawn('npx', ['hardhat', 'run', 'scripts/test-simple.js'], {
  cwd: projectDir,
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true,
  env: {
    ...process.env,
    // Force colors in output
    FORCE_COLOR: '1',
    DEBUG: '*',
    NODE_OPTIONS: '--no-warnings --inspect=0'
  }
});

hardhat.stdout.on('data', (data) => {
  console.log(`[stdout] ${data}`);});

hardhat.stderr.on('data', (data) => {
  console.error(`[stderr] ${data}`);
});

hardhat.on('close', (code) => {
  console.log(`\n=== Process exited with code ${code} ===`);
});

// Also log any errors
hardhat.on('error', (error) => {
  console.error('Error:', error);
});

// Set a timeout to prevent hanging
setTimeout(() => {
  console.error('\n=== Timeout reached, killing process ===');
  hardhat.kill('SIGTERM');
}, 10000);
