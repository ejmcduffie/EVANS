// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title MockV3Aggregator
 * @notice Based on the Chainlink AggregatorV3Interface
 */
contract MockV3Aggregator {
    uint8 public decimals;
    int256 private _latestAnswer;
    uint256 private _updatedAt;
    uint80 private _latestRoundId;

    struct RoundData {
        uint80 roundId;
        int256 answer;
        uint256 startedAt;
        uint256 updatedAt;
        uint80 answeredInRound;
    }

    mapping(uint80 => RoundData) private _roundData;

    constructor(uint8 _decimals, int256 _initialAnswer) {
        decimals = _decimals;
        _latestAnswer = _initialAnswer;
        _updatedAt = block.timestamp;
        _latestRoundId = 1;
        _roundData[1] = RoundData(1, _initialAnswer, block.timestamp, block.timestamp, 1);
    }

    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ) {
        RoundData memory data = _roundData[_latestRoundId];
        return (data.roundId, data.answer, data.startedAt, data.updatedAt, data.answeredInRound);
    }

    function getRoundData(uint80 _roundId) external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ) {
        RoundData memory data = _roundData[_roundId];
        require(data.updatedAt > 0, "No data present");
        return (data.roundId, data.answer, data.startedAt, data.updatedAt, data.answeredInRound);
    }

    function updateAnswer(int256 _answer) external {
        _latestAnswer = _answer;
        _updatedAt = block.timestamp;
        _latestRoundId++;
        _roundData[_latestRoundId] = RoundData(
            _latestRoundId,
            _answer,
            block.timestamp,
            block.timestamp,
            _latestRoundId
        );
    }
}

// This is a minimal implementation for testing purposes. In production, use the official Chainlink AggregatorV3Interface.
