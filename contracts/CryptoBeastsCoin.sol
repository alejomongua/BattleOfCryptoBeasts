// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CryptoBeastsCoin is ERC20, Ownable {
    uint256 private constant TOTAL_SUPPLY = 100_000_000 * 10 ** 18; // 100,000,000 tokens with 18 decimal places
    uint256 private constant FOUNDERS_ALLOCATION = (TOTAL_SUPPLY * 10) / 100; // 10% for founders
    uint256 private constant RESERVES_ALLOCATION = (TOTAL_SUPPLY * 20) / 100; // 20% for reserves
    uint256 private constant REWARDS_ALLOCATION = (TOTAL_SUPPLY * 70) / 100; // 70% for player rewards

    mapping(address => uint256) public pendingRewards;

    // Define variable for the current rewards remaining
    uint256 public rewardsPool;

    constructor(address reservesWallet) ERC20("CryptoBeastsCoin", "CBC") {
        // Allocate tokens for founders and reserves
        // The founders tokens will be sent to the owner of the contract
        _mint(msg.sender, FOUNDERS_ALLOCATION);
        _mint(reservesWallet, RESERVES_ALLOCATION);

        // Allocate the remaining tokens for player rewards
        _mint(address(this), REWARDS_ALLOCATION);

        rewardsPool = REWARDS_ALLOCATION;
    }

    function updatePlayerRewards(
        address player,
        uint256 amount
    ) external onlyOwner {
        require(
            rewardsPool >= amount,
            "CryptoBeastsCoin: Not enough tokens left for rewards"
        );
        pendingRewards[player] += amount;
        rewardsPool -= amount;
    }

    function claimRewards() external {
        uint256 reward = pendingRewards[msg.sender];
        require(reward > 0, "CryptoBeastsCoin: No rewards available to claim");

        pendingRewards[msg.sender] = 0;
        _transfer(address(this), msg.sender, reward);
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
                rewardsPool >= amount,
                "CryptoBeastsCoin: Not enough tokens left for rewards"
            );
            pendingRewards[player] += amount;
            rewardsPool -= amount;
        }
    }

    function getPlayerRewards(address player) external view returns (uint256) {
        return pendingRewards[player];
    }
}
