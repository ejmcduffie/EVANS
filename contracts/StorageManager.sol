// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@chainlink/contracts/src/v0.8/automation/interfaces/KeeperCompatibleInterface.sol";

/**
 * @title StorageManager
 * @dev Upgradeable contract to manage per-file ANC cost tracking and burning.
 */
contract StorageManager is Initializable, OwnableUpgradeable, KeeperCompatibleInterface {
    ERC20BurnableUpgradeable public ancToken;

    // fileHash => total ANC paid for storage
    mapping(bytes32 => uint256) public totalPaidANC;
    // user => fileHash => ANC paid
    mapping(address => mapping(bytes32 => uint256)) public userPaidANC;
    // total ANC paid for all files
    uint256 public totalANCSpent;

    event FileStoragePaid(address indexed user, bytes32 indexed fileHash, uint256 amount);
    event ANCSpent(address indexed user, uint256 amount, string purpose);
    event AutoBurned(uint256 amount, uint256 timestamp);

    /// @custom:oz-upgrades-unsafe-allow constructor
    

    // Keeper state
    uint256 public lastBurn;
    uint256 public burnInterval;
    uint256 public burnAmount;

    function initialize(address _ancToken) public initializer {
        require(_ancToken != address(0), "ANC token required");
        __Ownable_init();
        ancToken = ERC20BurnableUpgradeable(_ancToken);
        burnInterval = 1 weeks;
        burnAmount = 10 * 1e18; // Default: 10 ANC
        lastBurn = block.timestamp;
    }

    /**
     * @notice Set auto-burn parameters (only owner)
     */
    function setAutoBurnParams(uint256 _interval, uint256 _amount) external onlyOwner {
        require(_interval > 0, "Interval must be > 0");
        require(_amount > 0, "Amount must be > 0");
        burnInterval = _interval;
        burnAmount = _amount;
    }

    /**
     * @notice Pay ANC for file storage/oracle and track stats.
     * @param fileHash Hash or ID of the file.
     * @param amount Amount of ANC to burn.
     * @param purpose Purpose string (e.g., 'arweave', 'oracle').
     */
    function payForFileStorage(bytes32 fileHash, uint256 amount, string calldata purpose) external {
        require(amount > 0, "Zero amount");
        require(fileHash != bytes32(0), "Invalid fileHash");
        // Burn ANC from sender
        ancToken.burnFrom(msg.sender, amount);
        // Update stats
        totalPaidANC[fileHash] += amount;
        userPaidANC[msg.sender][fileHash] += amount;
        totalANCSpent += amount;
        emit FileStoragePaid(msg.sender, fileHash, amount);
        emit ANCSpent(msg.sender, amount, purpose);
    }

    /**
     * @notice Get total ANC paid for a file.
     */
    function getTotalPaidForFile(bytes32 fileHash) external view returns (uint256) {
        return totalPaidANC[fileHash];
    }

    /**
     * @notice Get total ANC paid by a user for a file.
     */
    function getUserPaidForFile(address user, bytes32 fileHash) external view returns (uint256) {
        return userPaidANC[user][fileHash];
    }

    /**
     * @notice Get total ANC spent across all files.
     */
    function getTotalANCSpent() external view returns (uint256) {
        return totalANCSpent;
    }

    // Chainlink Automation (Keepers) functions
    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory) {
        upkeepNeeded = (block.timestamp - lastBurn) >= burnInterval && ancToken.balanceOf(address(this)) >= burnAmount;
    }

    function performUpkeep(bytes calldata) external override {
        require((block.timestamp - lastBurn) >= burnInterval, "Burn interval not reached");
        require(ancToken.balanceOf(address(this)) >= burnAmount, "Not enough ANC to burn");
        ancToken.burn(burnAmount);
        lastBurn = block.timestamp;
        emit AutoBurned(burnAmount, lastBurn);
    }
}
