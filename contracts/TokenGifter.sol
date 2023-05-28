// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenGifter is Ownable {
    IERC20 public token;
    mapping(address => uint256) public giftedAmounts;
    uint256 public constant MAX_GIFT_AMOUNT = 400 * 10 ** 18; // Asume que tu token tiene 18 decimales

    constructor(IERC20 _token) {
        token = _token;
    }

    function giftTokens(address _to) external onlyOwner {
        require(giftedAmounts[_to] < MAX_GIFT_AMOUNT, "Already claimed");

        uint256 amountToGift = MAX_GIFT_AMOUNT - giftedAmounts[_to];
        token.transfer(_to, amountToGift);
        giftedAmounts[_to] += amountToGift;
    }

    function withdrawAll() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        token.transfer(owner(), balance);
    }
}
