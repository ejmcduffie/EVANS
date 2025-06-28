// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TreasuryRouter
 * @notice Accepts ANC deposits, calculates AR (storage) and LINK (oracle) allocations using live
 *         Chainlink price feeds, and logs the purchase. This is a simplified simulation for the
 *         Chromion hackathon – no on-chain swaps are performed; AR/LINK balances are handled off-chain.
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract TreasuryRouter {
    IERC20 public immutable anc;
    IERC20 public immutable ar;
    IERC20 public immutable link;

    AggregatorV3Interface public immutable ancUsdFeed;
    AggregatorV3Interface public immutable arUsdFeed;
    AggregatorV3Interface public immutable linkUsdFeed;

    // Constants (18-dec token amounts)
    uint256 public constant AR_PER_GB = 24e16;    // 0.24 AR per GiB
    uint256 public constant LINK_PER_CALL = 1e14; // 0.0001 LINK per API call

    event StoragePurchased(
        address indexed user,
        uint256 gibBought,
        uint256 ancSpent,
        uint256 arAllocated,
        uint256 linkAllocated
    );

    constructor(
        address _anc,
        address _ar,
        address _link,
        address _ancUsdFeed,
        address _arUsdFeed,
        address _linkUsdFeed
    ) {
        anc = IERC20(_anc);
        ar = IERC20(_ar);
        link = IERC20(_link);
        ancUsdFeed = AggregatorV3Interface(_ancUsdFeed);
        arUsdFeed = AggregatorV3Interface(_arUsdFeed);
        linkUsdFeed = AggregatorV3Interface(_linkUsdFeed);
    }

    /// @notice Buys `gib` gigabytes of storage and `apiCalls` Chainlink oracle calls.
    /// @param gib      Amount of storage (GiB)
    /// @param apiCalls Number of expected oracle calls to fund
    function purchaseStorage(uint256 gib, uint256 apiCalls) external {
        require(gib > 0, "gib=0");

        uint256 arNeeded = gib * AR_PER_GB; // 18-dec
        uint256 linkNeeded = apiCalls * LINK_PER_CALL; // 18-dec

        // Fetch latest USD prices (8-decimals)
        uint256 ancUsd = _latestPrice(ancUsdFeed);
        uint256 arUsd = _latestPrice(arUsdFeed);
        uint256 linkUsd = _latestPrice(linkUsdFeed);

        // Convert AR & LINK to USD (18+8 = 26 decimals)
        uint256 arCostUsd = (arNeeded * arUsd) / 1e8;
        uint256 linkCostUsd = (linkNeeded * linkUsd) / 1e8;

        uint256 totalUsd = arCostUsd + linkCostUsd; // 18-decimals

        // Calculate ANC to spend: (totalUsd / ancUsd) * 1e8 to balance decimals, then to 18-dec tokens
        uint256 ancToSpend = (totalUsd * 1e8) / ancUsd;

        // Transfer ANC from user
        require(anc.transferFrom(msg.sender, address(this), ancToSpend), "ANC transfer failed");

        emit StoragePurchased(msg.sender, gib, ancToSpend, arNeeded, linkNeeded);
    }

    /* ------------------------------------------------------------- */
    /*                           PRICE FEEDS                         */
    /* ------------------------------------------------------------- */

    function _latestPrice(AggregatorV3Interface feed) private view returns (uint256) {
        (, int256 answer,,,) = feed.latestRoundData();
        require(answer > 0, "bad price");
        return uint256(answer);
    }
}
