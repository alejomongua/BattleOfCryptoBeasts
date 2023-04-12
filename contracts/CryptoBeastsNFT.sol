// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract CryptoBeastsNFT is ERC721Enumerable, Ownable, Pausable {
    using Counters for Counters.Counter;

    IERC20 public paymentToken;

    uint256 private constant MAX_SUPPLY = 100000; // Suministro máximo de cartas de cada tipo
    // uint256 public constant SINGLE_CARD_COST = 10 * 10 ** 18;
    // uint256 public constant SPECIFIC_CARD_COST = 12 * 10 ** 18;
    uint256 public constant RANDOM_DECK_COST = 360 * 10 ** 18;
    uint256 public constant BURN_REWARD = RANDOM_DECK_COST / 40 - 2 * 10 ** 18;

    // Probabilidades:
    uint256 public constant LEGENDARY_PROBABILITY = 5;
    uint256 public constant RARE_PROBABILITY = 20;
    // Probabilidad de común = 100 - LEGENDARY_PROBABILITY - RARE_PROBABILITY

    // Variables de estado para llevar la cuenta de cuántas cartas de cada tipo se han creado
    uint256 public totalCriaturas;
    uint256 public totalHabilidades;
    uint256 public totalObjetos;

    Counters.Counter private _tokenIdTracker;

    struct Card {
        // cardType: 0: Criatura, 1: Habilidad, 2: Objeto, es el módulo 3 del cardId
        uint256 cardId;
        uint8 rarity;
    }

    // Mapping desde token ID a Card
    mapping(uint256 => Card) public cards;

    // Cantidad de cartas disponibles para cada cardId
    mapping(uint256 => uint256) public cardStock;

    // Constructor
    constructor(address _paymentToken) ERC721("CryptoBeastsNFT", "CBNFT") {
        paymentToken = IERC20(_paymentToken);
        totalCriaturas = 0;
        totalHabilidades = 0;
        totalObjetos = 0;

        // Agrega el set inicial de cartas
        _agregarSetCartas(
            21, // 21 criaturas iniciales
            11, // 11 Habilidades iniciales
            11, // 11 objetos iniciales
            MAX_SUPPLY
        );
    }

    function _getRandomNumber(uint8 upperBound) private view returns (uint8) {
        bytes32 randomHash = keccak256(
            abi.encodePacked(block.timestamp, block.prevrandao, msg.sender)
        );
        uint256 output = uint256(randomHash) % upperBound;
        return uint8(output);
    }

    function _getRandomRarity() private view returns (uint8) {
        uint256 random = _getRandomNumber(100);
        if (random < LEGENDARY_PROBABILITY) {
            return 3; // Legendaria
        } else if (random < LEGENDARY_PROBABILITY + RARE_PROBABILITY) {
            return 2; // Rara
        } else {
            // 75% de probabilidad
            return 1; // Común
        }
    }

    function mint(address to, uint256 _cardId, uint8 _cardType) private {
        // to do
    }

    function mint(address to, uint256 _cardId) private {
        // to do
        require(_tokenIdTracker.current() < MAX_SUPPLY, "No cards left");
        require(cardStock[_cardId] > 0, "No stock left for this card");

        uint8 randomRarity = _getRandomRarity();

        _tokenIdTracker.increment();
        uint256 tokenId = _tokenIdTracker.current();

        cards[tokenId] = Card(_cardId, randomRarity);
        cardStock[_cardId] -= 1;

        _safeMint(to, tokenId);
    }

    // Función para agregar nuevos sets de cartas
    function _agregarSetCartas(
        uint256 cantidadCriaturas,
        uint256 cantidadHabilidades,
        uint256 cantidadObjetos,
        uint256 stockInicial
    ) private {
        // Añadir criaturas al cardStock
        for (
            uint256 i = totalCriaturas * 3;
            i < (totalCriaturas + cantidadCriaturas) * 3;
            i += 3
        ) {
            cardStock[i] = stockInicial;
        }

        // Añadir habilidades al cardStock
        for (
            uint256 i = totalHabilidades * 3 + 1;
            i < (totalHabilidades + cantidadHabilidades) * 3 + 1;
            i += 3
        ) {
            cardStock[i] = stockInicial;
        }

        // Añadir objetos al cardStock
        for (
            uint256 i = totalObjetos * 3 + 2;
            i < (totalObjetos + cantidadObjetos) * 3 + 2;
            i += 3
        ) {
            cardStock[i] = stockInicial;
        }

        // Actualiza las variables de estado
        totalCriaturas += cantidadCriaturas;
        totalHabilidades += cantidadHabilidades;
        totalObjetos += cantidadObjetos;
    }

    /* 
    // Las funciones para mintear una sola carta se eliminan para que tenga
    // sentido el marketplace
    function buySpecificCard(
        uint8 _cardType,
        uint256 _cardId
    ) external whenNotPaused {
        paymentToken.transferFrom(
            msg.sender,
            address(this),
            SPECIFIC_CARD_COST
        );
        mint(msg.sender, _cardId, cardType);
    }

    function buyRandomCard(uint8 _cardType) external whenNotPaused {
        paymentToken.transferFrom(msg.sender, address(this), SINGLE_CARD_COST);
        uint256 randomCardId = _getRandomCardId(_cardType);
        mint(msg.sender, randomCardId);
    }
    */

    function buyRandomDeck() external whenNotPaused {
        paymentToken.transferFrom(msg.sender, address(this), RANDOM_DECK_COST);
        for (uint8 i = 0; i < 20; i++) {
            uint256 randomCreatureId = _getRandomCardId(1);
            mint(msg.sender, randomCreatureId, 1);
        }
        for (uint8 i = 0; i < 10; i++) {
            uint256 randomAbilityId = _getRandomCardId(2);
            mint(msg.sender, randomAbilityId, 2);

            uint256 randomObjectId = _getRandomCardId(3);
            mint(msg.sender, randomObjectId, 3);
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

    // Función pública para agregar nuevos sets de cartas, restringida al propietario del contrato
    function agregarSetCartas(
        uint256 cantidadCriaturas,
        uint256 cantidadHabilidades,
        uint256 cantidadObjetos,
        uint256 stockInicial
    ) external onlyOwner {
        _agregarSetCartas(
            cantidadCriaturas,
            cantidadHabilidades,
            cantidadObjetos,
            stockInicial
        );
    }

    function pauseContract() external onlyOwner {
        _pause();
    }

    function unpauseContract() external onlyOwner {
        _unpause();
    }
}
