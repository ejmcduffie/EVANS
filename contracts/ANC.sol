// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// -----------------------------------------------------------------------------
// AncestryCoin (ANC) - Simple test ERC-20 token for Polygon Amoy
// -----------------------------------------------------------------------------
// • Deploys with an initial supply minted to the deployer.
// • Owner can mint additional tokens if needed.
// -----------------------------------------------------------------------------
contract ANC is ERC20 {
    address public owner;
    
    constructor() ERC20("AncestryCoin", "ANC") {
        owner = msg.sender;
        // Mint 1,000,000 ANC to deployer (18 decimals)
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }
    
    // Simple mint function (only owner can mint)
    function mint(address to, uint256 amount) public {
        require(msg.sender == owner, "Only owner can mint");
        _mint(to, amount);
    }
}
