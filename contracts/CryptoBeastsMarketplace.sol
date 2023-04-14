// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract CryptoBeastsMarketplace is
    ERC721Holder,
    ReentrancyGuard,
    Ownable,
    Pausable
{
    IERC20 private _beastCoin;
    IERC721 private _beastNFT;
    uint256 private _feePercentage;

    struct Offer {
        bool isForSale;
        uint256 price;
        address seller;
    }

    mapping(uint256 => Offer) private _tokenOffers;

    event TokenOfferCreated(
        uint256 indexed tokenId,
        uint256 price,
        address indexed seller
    );
    event TokenOfferCancelled(uint256 indexed tokenId);
    event TokenPurchased(
        uint256 indexed tokenId,
        uint256 price,
        address indexed buyer,
        address indexed seller
    );

    constructor(
        address beastCoinAddress,
        address beastNFTAddress,
        uint256 feePercentage
    ) {
        _beastCoin = IERC20(beastCoinAddress);
        _beastNFT = IERC721(beastNFTAddress);
        _feePercentage = feePercentage;
    }

    function createTokenOffer(
        uint256 tokenId,
        uint256 price
    ) external whenNotPaused {
        require(
            _beastNFT.ownerOf(tokenId) == msg.sender,
            "Only the owner can create offers."
        );
        _beastNFT.safeTransferFrom(msg.sender, address(this), tokenId);

        _tokenOffers[tokenId] = Offer({
            isForSale: true,
            price: price,
            seller: msg.sender
        });

        emit TokenOfferCreated(tokenId, price, msg.sender);
    }

    function cancelTokenOffer(uint256 tokenId) external {
        require(
            _tokenOffers[tokenId].seller == msg.sender,
            "Only the seller can cancel offers."
        );

        _beastNFT.safeTransferFrom(address(this), msg.sender, tokenId);

        delete _tokenOffers[tokenId];
        emit TokenOfferCancelled(tokenId);
    }

    function buyToken(uint256 tokenId) external whenNotPaused nonReentrant {
        Offer storage offer = _tokenOffers[tokenId];
        require(offer.isForSale, "Token is not for sale.");

        uint256 fee = (offer.price * _feePercentage) / 100;
        uint256 sellerPayment = offer.price - fee;

        _beastCoin.transferFrom(msg.sender, address(this), fee);
        _beastCoin.transferFrom(msg.sender, offer.seller, sellerPayment);

        _beastNFT.safeTransferFrom(address(this), msg.sender, tokenId);

        delete _tokenOffers[tokenId];
        emit TokenPurchased(tokenId, offer.price, msg.sender, offer.seller);
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = _beastCoin.balanceOf(address(this));
        _beastCoin.transfer(owner(), balance);
    }

    function getTokenOffer(
        uint256 tokenId
    ) external view returns (Offer memory) {
        return _tokenOffers[tokenId];
    }

    function setFeePercentage(uint256 feePercentage) external onlyOwner {
        _feePercentage = feePercentage;
    }

    function getFeePercentage() external view returns (uint256) {
        return _feePercentage;
    }

    function getContractTokenBalance() external view returns (uint256) {
        return _beastCoin.balanceOf(address(this));
    }

    function pauseContract() external onlyOwner {
        _pause();
    }

    function unpauseContract() external onlyOwner {
        _unpause();
    }
}
