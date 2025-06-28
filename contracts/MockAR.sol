// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockAR
/// @notice A simple ERC-20 that simulates the Arweave (AR) token on Polygon testnet. Minted 1 000 000 tokens to deployer for testing.
contract MockAR is ERC20 {
    constructor() ERC20("Mock Arweave", "mAR") {
        _mint(msg.sender, 1_000_000 ether);
    }
}
