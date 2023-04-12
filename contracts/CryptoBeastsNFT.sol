// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract CryptoBeastsNFT is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    IERC20 public paymentToken;

    uint256 public constant MAX_SUPPLY = 10000; // Suministro máximo de cartas
    uint256 public constant SINGLE_CARD_COST = 10 * 10 ** 18;
    uint256 public constant SPECIFIC_CARD_COST = 12 * 10 ** 18;
    uint256 public constant RANDOM_DECK_COST = 360 * 10 ** 18;

    uint256 public constant BURN_REWARD = RANDOM_DECK_COST / 40 - 2 * 10 ** 18;

    Counters.Counter private _tokenIdTracker;

    struct Card {
        uint8 cardType; // 1: Criatura, 2: Habilidad, 3: Objeto
        uint256 cardId;
    }

    // Mapping desde token ID a Card
    mapping(uint256 => Card) public cards;

    // Cantidad de cartas disponibles para cada cardId
    mapping(uint256 => uint256) public cardStock;

    // Constructor
    constructor(address _paymentToken) ERC721("CryptoBeastsNFT", "CBC") {
        paymentToken = IERC20(_paymentToken);
        // Inicializa el stock de cartas aquí
    }

    function mint(address to, uint8 _cardType, uint256 _cardId) private {
        require(_tokenIdTracker.current() < MAX_SUPPLY, "No cards left");
        require(cardStock[_cardId] > 0, "No stock left for this card");

        _tokenIdTracker.increment();
        uint256 tokenId = _tokenIdTracker.current();

        cards[tokenId] = Card(_cardType, _cardId);
        cardStock[_cardId] = cardStock[_cardId].sub(1);

        _mint(to, tokenId);
    }

    function buySpecificCard(uint8 _cardType, uint256 _cardId) external {
        paymentToken.transferFrom(
            msg.sender,
            address(this),
            SPECIFIC_CARD_COST
        );
        mint(msg.sender, _cardType, _cardId);
    }

    function buyRandomCard(uint8 _cardType) external {
        paymentToken.transferFrom(msg.sender, address(this), SINGLE_CARD_COST);
        uint256 randomCardId = _getRandomCardId(_cardType);
        mint(msg.sender, _cardType, randomCardId);
    }

    function buyRandomDeck() external {
        paymentToken.transferFrom(msg.sender, address(this), RANDOM_DECK_COST);
        for (uint8 i = 0; i < 20; i++) {
            uint256 randomCreatureId = _getRandomCardId(1);
            mint(msg.sender, 1, randomCreatureId);
        }
        for (uint8 i = 0; i < 10; i++) {
            uint256 randomAbilityId = _getRandomCardId(2);
            mint(msg.sender, 2, randomAbilityId);

            uint256 randomObjectId = _getRandomCardId(3);
            mint(msg.sender, 3, randomObjectId);
        }
    }

    function burn(uint256 tokenId) external {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only the owner can burn this token"
        );
        _burn(tokenId);

        uint256 rewardAmount = BURN_REWARD;
        paymentToken.transfer(msg.sender, rewardAmount);
    }

    function _getRandomCardId(uint8 _cardType) private view returns (uint256) {
        // Implementa una función para obtener un cardId aleatorio según el tipo de carta
        // Ten en cuenta que debe haber stock disponible de la carta seleccionada
    }

    function remainingCards(uint256 _cardId) external view returns (uint256) {
        return cardStock[_cardId];
    }

    // Función para retirar tokens del contrato (usada por el propietario del contrato)
    function withdraw() external onlyOwner {
        uint256 balance = paymentToken.balanceOf(address(this));
        paymentToken.transfer(msg.sender, balance);
    }
}
