// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CryptoBeastsCoin is ERC20, Ownable {
    uint256 private constant TOTAL_SUPPLY = 100_000_000 * 10 ** 18; // 1,000,000 tokens with 18 decimal places
    uint256 private constant FOUNDERS_ALLOCATION = (TOTAL_SUPPLY * 10) / 100; // 10% for founders
    uint256 private constant RESERVES_ALLOCATION = (TOTAL_SUPPLY * 20) / 100; // 20% for reserves
    uint256 private constant REWARDS_ALLOCATION = (TOTAL_SUPPLY * 70) / 100; // 70% for player rewards

    mapping(address => uint256) private rewards;

    // Define variable for the current rewards remaining
    uint256 public rewardsRemaining;

    constructor(
        address foundersWallet,
        address reservesWallet
    ) ERC20("CryptoBeastsCoin", "CBC") {
        // Allocate tokens for founders and reserves
        _mint(foundersWallet, FOUNDERS_ALLOCATION);
        _mint(reservesWallet, RESERVES_ALLOCATION);

        // Allocate the remaining tokens for player rewards
        _mint(address(this), REWARDS_ALLOCATION);

        rewardsRemaining = REWARDS_ALLOCATION;
    }

    function updatePlayerRewards(
        address player,
        uint256 amount
    ) external onlyOwner {
        require(
            rewardsRemaining >= amount,
            "CryptoBeastsCoin: Not enough tokens left for rewards"
        );
        rewards[player] += amount;
        rewardsRemaining -= amount;
    }

    function claimRewards() external {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "CryptoBeastsCoin: No rewards available to claim");

        _transfer(address(this), msg.sender, reward);
        rewards[msg.sender] = 0;
    }

    function updateMultiplePlayerRewards(
        address[] calldata players,
        uint256[] calldata amounts
    ) external onlyOwner {
        require(
            players.length < 100,
            "CryptoBeastsCoin: Too many players to update at once"
        );
        require(
            players.length == amounts.length,
            "CryptoBeastsCoin: Array length must match"
        );

        for (uint256 i = 0; i < players.length; i++) {
            address player = players[i];
            uint256 amount = amounts[i];

            require(
                rewardsRemaining >= amount,
                "CryptoBeastsCoin: Not enough tokens left for rewards"
            );
            rewards[player] += amount;
            rewardsRemaining -= amount;
        }
    }

    function getPlayerRewards(address player) external view returns (uint256) {
        return rewards[player];
    }
}
