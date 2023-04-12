// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CryptoBeastsMarketplace {
    address public nonFungibleTokenAddress;
    address public tokenAddress;

    uint256 private orderId;

    struct Offer {
        bool isForSale;
        uint256 tokenId;
        address seller;
        uint256 price;
        uint256 index;
    }

    mapping(uint256 => Offer) public tokenIdToOffer;
    mapping(uint256 => uint256) private tokenPrice;

    event TokenOffered(
        uint256 indexed tokenId,
        uint256 price,
        address indexed seller
    );
    event TokenSold(
        uint256 indexed tokenId,
        uint256 price,
        address indexed buyer,
        address indexed seller
    );

    constructor(address _nonFungibleTokenAddress, address _tokenAddress) {
        nonFungibleTokenAddress = _nonFungibleTokenAddress;
        tokenAddress = _tokenAddress;
    }

    function offerToken(uint256 _tokenId, uint256 _price) public {
        IERC721 nonFungibleToken = IERC721(nonFungibleTokenAddress);
        require(
            nonFungibleToken.ownerOf(_tokenId) == msg.sender,
            "You must own the token to offer it for sale"
        );

        nonFungibleToken.transferFrom(msg.sender, address(this), _tokenId);

        Offer memory offer = Offer(
            true,
            _tokenId,
            msg.sender,
            _price,
            orderId++
        );
        tokenIdToOffer[_tokenId] = offer;

        emit TokenOffered(_tokenId, _price, msg.sender);
    }

    function buyToken(uint256 _tokenId) public {
        Offer memory offer = tokenIdToOffer[_tokenId];
        require(offer.isForSale, "Token is not for sale");

        IERC20 token = IERC20(tokenAddress);
        token.transferFrom(msg.sender, offer.seller, offer.price);

        IERC721 nonFungibleToken = IERC721(nonFungibleTokenAddress);
        nonFungibleToken.transferFrom(address(this), msg.sender, _tokenId);

        delete tokenIdToOffer[_tokenId];

        emit TokenSold(_tokenId, offer.price, msg.sender, offer.seller);
    }
}
