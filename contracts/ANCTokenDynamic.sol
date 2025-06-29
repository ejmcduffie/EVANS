// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
 *   ANCTokenDynamic – ERC-20 with dynamic pricing and service-fee helpers
 *   -------------------------------------------------------------------
 *   • Users buy ANC with native MATIC; price is derived from Chainlink 
 *     MATIC / USD feed so 1 ANC ~= `targetUsdPrice` USD.
 *   • Treasury receives all MATIC; view helper exposes balance.
 *   • Built-in helpers to burn ANC for Arweave storage and Chainlink calls.
 *   • Designed for Polygon Amoy but deployer can pass any price-feed addr.
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract ANCTokenDynamic is ERC20, Ownable, ReentrancyGuardUpgradeable {
    // ------------------------------------------------------------------
    // Constants & immutables
    // ------------------------------------------------------------------
    uint256 public constant MAX_SUPPLY = 10_000_000 * 1e18; // 10M ANC (18d)
    uint256 public constant INITIAL_SUPPLY_FOR_SALE = 1_000_000 * 1e18; // in contract

    // Service-cost defaults (can be changed by owner)
    uint256 public arweaveStorageCostPerMB = 10 * 1e18; // 10 ANC / MB
    uint256 public chainlinkCallCost      = 1  * 1e18; // 1  ANC / call

    // Desired USD price per ANC expressed with 8 decimals (e.g., $0.10 => 10-000-000)
    uint256 public targetUsdPrice; // 8-decimals, editable

    // Chainlink price feed (e.g., MATIC / USD on Amoy)
    AggregatorV3Interface public immutable maticUsdFeed;

    // Treasury address that collects MATIC
    address public treasury;

    // ------------------------------------------------------------------
    // Events
    // ------------------------------------------------------------------
    event TokensPurchased(address indexed buyer, uint256 maticPaid, uint256 ancReceived);
    event TokensBurned(address indexed user, uint256 amount, string purpose);
    event TreasuryWithdrawal(address indexed to, uint256 amount);
    event ServiceCostsUpdated(uint256 newArweaveCost, uint256 newChainlinkCost);
    event TargetUsdPriceUpdated(uint256 oldPrice, uint256 newPrice);

    constructor(
        address _treasury,
        address _maticUsdFeed,
        uint256 _targetUsdPrice // 8 decimals (1e8 == $1)
    ) ERC20("AncestryCoin", "ANC") Ownable() {
        require(_treasury != address(0), "Treasury zero");
        require(_maticUsdFeed != address(0), "Feed zero");
        treasury = _treasury;
        maticUsdFeed = AggregatorV3Interface(_maticUsdFeed);
        targetUsdPrice = _targetUsdPrice;

        // Mint tokens for sale into the contract itself
        _mint(address(this), INITIAL_SUPPLY_FOR_SALE);
        // Mint small amount to owner for testing/dev
        _mint(msg.sender, 10_000 * 1e18);
    }

    // ------------------------------------------------------------------
    // Dynamic pricing helpers
    // ------------------------------------------------------------------

    /**
     * @notice Returns current ANC price in wei (MATIC).
     */
    function getTokenPriceInMatic() public view returns (uint256 priceWei) {
        (, int256 answer,,,) = maticUsdFeed.latestRoundData();
        require(answer > 0, "Invalid price");
        uint256 maticUsd = uint256(answer); // 8 decimals
        // priceWei = targetUsdPrice / maticUsd * 1e18
        priceWei = (targetUsdPrice * 1e18) / maticUsd;
    }

    /**
     * @dev User buys ANC with native MATIC at dynamic price.
     */
    function purchaseTokens() external payable nonReentrant {
        require(msg.value > 0, "No MATIC sent");
        uint256 priceWei = getTokenPriceInMatic();
        uint256 tokensToTransfer = (msg.value * 1e18) / priceWei;
        require(tokensToTransfer > 0, "Insufficient MATIC for 1 ANC");
        require(balanceOf(address(this)) >= tokensToTransfer, "ANC sold out - add liquidity");

        _transfer(address(this), msg.sender, tokensToTransfer);
        emit TokensPurchased(msg.sender, msg.value, tokensToTransfer);

        // Forward funds to treasury
        (bool ok,) = treasury.call{value: msg.value}("");
        require(ok, "Treasury transfer failed");
    }

    // ------------------------------------------------------------------
    // Service-cost helpers (Storage & Oracle payments)
    // ------------------------------------------------------------------

    function purchaseArweaveStorage(uint256 storageMB) external nonReentrant {
        uint256 cost = storageMB * arweaveStorageCostPerMB;
        _burn(msg.sender, cost);
        emit TokensBurned(msg.sender, cost, "arweave");
    }

    function payForChainlinkCall() external nonReentrant {
        _burn(msg.sender, chainlinkCallCost);
        emit TokensBurned(msg.sender, chainlinkCallCost, "chainlink");
    }

    // ------------------------------------------------------------------
    // Owner admin
    // ------------------------------------------------------------------

    function updateServiceCosts(uint256 newArCost, uint256 newClCost) external onlyOwner {
        require(newArCost > 0 && newClCost > 0, "Zero cost");
        arweaveStorageCostPerMB = newArCost;
        chainlinkCallCost = newClCost;
        emit ServiceCostsUpdated(newArCost, newClCost);
    }

    function updateTargetUsdPrice(uint256 newUsdPrice) external onlyOwner {
        require(newUsdPrice > 0, "Zero price");
        uint256 old = targetUsdPrice;
        targetUsdPrice = newUsdPrice;
        emit TargetUsdPriceUpdated(old, newUsdPrice);
    }

    /**
     * @notice Withdraw any un-sold tokens from contract to owner.
     */
    function withdrawUnsold(uint256 amount) external onlyOwner {
        _transfer(address(this), owner(), amount);
    }

    /**
     * @notice Emergency treasury withdrawal.
     */
    function withdrawTreasury(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Too much");
        (bool ok,) = treasury.call{value: amount}("");
        require(ok, "Withdrawal failed");
        emit TreasuryWithdrawal(treasury, amount);
    }

    // ------------------------------------------------------------------
    // Views
    // ------------------------------------------------------------------
    function treasuryBalance() external view returns (uint256) {
        return treasury.balance;
    }

    function getPricing()
        external
        view
        returns (uint256 priceMaticWei, uint256 arCost, uint256 clCost)
    {
        priceMaticWei = getTokenPriceInMatic();
        arCost = arweaveStorageCostPerMB;
        clCost = chainlinkCallCost;
    }
}
