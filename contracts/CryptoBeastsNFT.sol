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

    uint256 public constant BOOSTER_PACK_COST = 50 * 10 ** 18;
    uint256 public constant BURN_REWARD = 7 * 10 ** 18;

    // Suministro del grupo inicial
    uint256 private constant MAX_SUPPLY = 100;
    uint256 private constant CANTIDAD_CRIATURAS_INICIALES = 21;
    uint256 private constant CANTIDAD_HABILIDADES_INICIALES = 11;
    uint256 private constant CANTIDAD_OBJETOS_INICIALES = 11;

    // Probabilidades:
    uint256 public constant LEGENDARY_PROBABILITY = 5;
    uint256 public constant RARE_PROBABILITY = 20;
    // Probabilidad de común = 100 - LEGENDARY_PROBABILITY - RARE_PROBABILITY

    // Variables de estado para llevar la cuenta de cuántas cartas de cada tipo se han creado
    uint256 public totalCriaturas;
    uint256 public totalHabilidades;
    uint256 public totalObjetos;

    Counters.Counter private _tokenIdTracker;
    mapping(uint256 => mapping(uint8 => string)) private _cardURIs;

    struct Card {
        // cardType: 0: Criatura, 1: Habilidad, 2: Objeto, es el módulo 3 del cardId
        uint256 cardId;
        // string imageURI;
        uint8 rarity;
    }

    // Mapping desde token ID a Card
    mapping(uint256 => Card) public cards;

    // Cantidad de cartas disponibles para cada cardId
    mapping(uint256 => uint256) public cardStock;

    // Limitar la cantidad de cartas que se pueden quemar por día
    uint256 public burnLimit = 10; // Límite de cartas quemadas por usuario en un período de tiempo
    uint256 public burnTimeFrame = 86400; // Período de tiempo en segundos (86400 segundos = 24 horas)

    mapping(address => uint256) private _burnedCards;
    mapping(address => uint256) private _lastBurnTime;

    // Array que lleva la lista de cartas disponibles por tipo
    uint256[] public criaturasDisponibles;
    uint256[] public habilidadesDisponibles;
    uint256[] public objetosDisponibles;

    // Constructor
    constructor(address _paymentToken) ERC721("CryptoBeastsNFT", "CBNFT") {
        paymentToken = IERC20(_paymentToken);

        totalCriaturas = 0;
        totalHabilidades = 0;
        totalObjetos = 0;

        // Agrega el set inicial de cartas
        _agregarSetCartas(
            CANTIDAD_CRIATURAS_INICIALES,
            CANTIDAD_HABILIDADES_INICIALES,
            CANTIDAD_OBJETOS_INICIALES,
            MAX_SUPPLY
        );
    }

    function _getRandomNumber(
        uint256 upperBound,
        uint256 seed
    ) private view returns (uint256) {
        bytes32 randomHash = keccak256(
            abi.encodePacked(
                block.timestamp,
                blockhash(block.number - 1),
                msg.sender,
                seed
            )
        );
        return uint256(randomHash) % upperBound;
    }

    function _getRandomRarity(uint256 seed) private view returns (uint8) {
        uint256 random = _getRandomNumber(100, seed);
        if (random < LEGENDARY_PROBABILITY) {
            return 3; // Legendaria
        } else if (random < LEGENDARY_PROBABILITY + RARE_PROBABILITY) {
            return 2; // Rara
        } else {
            // 75% de probabilidad
            return 1; // Común
        }
    }

    function mint(address to, uint256 _cardId) private {
        require(cardStock[_cardId] > 0, "No stock left for this card");

        _tokenIdTracker.increment();
        uint256 tokenId = _tokenIdTracker.current();
        uint8 randomRarity = _getRandomRarity(tokenId);

        cards[tokenId] = Card(_cardId, randomRarity);
        cardStock[_cardId] -= 1;

        if (cardStock[_cardId] == 0) {
            // Eliminar _cardId de la lista de disponibles
            if (_cardId % 3 == 0) {
                // Criatura
                for (uint256 i = 0; i < criaturasDisponibles.length; i++) {
                    if (criaturasDisponibles[i] == _cardId) {
                        criaturasDisponibles[i] = criaturasDisponibles[
                            criaturasDisponibles.length - 1
                        ];
                        criaturasDisponibles.pop();
                        break;
                    }
                }
            } else if (_cardId % 3 == 1) {
                // Habilidad
                for (uint256 i = 0; i < habilidadesDisponibles.length; i++) {
                    if (habilidadesDisponibles[i] == _cardId) {
                        habilidadesDisponibles[i] = habilidadesDisponibles[
                            habilidadesDisponibles.length - 1
                        ];
                        habilidadesDisponibles.pop();
                        break;
                    }
                }
            } else {
                // Objeto
                for (uint256 i = 0; i < objetosDisponibles.length; i++) {
                    if (objetosDisponibles[i] == _cardId) {
                        objetosDisponibles[i] = objetosDisponibles[
                            objetosDisponibles.length - 1
                        ];
                        objetosDisponibles.pop();
                        break;
                    }
                }
            }
        }

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
            criaturasDisponibles.push(i);
        }

        // Añadir habilidades al cardStock
        for (
            uint256 i = totalHabilidades * 3 + 1;
            i < (totalHabilidades + cantidadHabilidades) * 3 + 1;
            i += 3
        ) {
            cardStock[i] = stockInicial;
            habilidadesDisponibles.push(i);
        }

        // Añadir objetos al cardStock
        for (
            uint256 i = totalObjetos * 3 + 2;
            i < (totalObjetos + cantidadObjetos) * 3 + 2;
            i += 3
        ) {
            cardStock[i] = stockInicial;
            objetosDisponibles.push(i);
        }

        // Actualiza las variables de estado
        totalCriaturas += cantidadCriaturas;
        totalHabilidades += cantidadHabilidades;
        totalObjetos += cantidadObjetos;
    }

    function buyBoosterPack(uint8 _cardType) external whenNotPaused {
        require(_cardType >= 1 && _cardType <= 3, "Invalid card type");

        for (uint8 i = 0; i < 5; i++) {
            uint256[] memory randomCardIds = _getRandomCardId(_cardType, 5);
            mint(msg.sender, randomCardIds[i]);
        }

        paymentToken.transferFrom(msg.sender, address(this), BOOSTER_PACK_COST);
    }

    // Permite cambiar el token de pago en caso de emergencia
    function updatePaymentToken(address _paymentToken) external onlyOwner {
        paymentToken = IERC20(_paymentToken);
    }

    function burn(uint256 tokenId) external {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only the owner can burn this token"
        );
        // Verifique que el contrato tiene suficiente saldo para pagar la recompensa
        require(
            paymentToken.balanceOf(address(this)) >= BURN_REWARD,
            "Contract has insufficient balance to pay reward"
        );

        uint256 currentTime = block.timestamp;
        uint256 userLastBurnTime = _lastBurnTime[msg.sender];

        if (currentTime - userLastBurnTime > burnTimeFrame) {
            // Reinicia el conteo de cartas quemadas si ha pasado el período de tiempo
            _burnedCards[msg.sender] = 0;
            _lastBurnTime[msg.sender] = currentTime;
        }

        require(
            _burnedCards[msg.sender] < burnLimit,
            "Burn limit reached for this time frame"
        );

        _burn(tokenId);

        _burnedCards[msg.sender] += 1;

        uint256 rewardAmount = BURN_REWARD;
        paymentToken.transfer(msg.sender, rewardAmount);
    }

    function _getRandomCardId(
        uint8 _cardType,
        uint256 _numCards
    ) private view returns (uint256[] memory) {
        uint256[] memory cardIds = new uint256[](_numCards);
        for (uint256 i = 0; i < _numCards; i++) {
            if (_cardType == 1) {
                uint256 randomIndex = _getRandomNumber(
                    criaturasDisponibles.length,
                    i
                );
                cardIds[i] = criaturasDisponibles[randomIndex];
            } else if (_cardType == 2) {
                uint256 randomIndex = _getRandomNumber(
                    habilidadesDisponibles.length,
                    i
                );
                cardIds[i] = habilidadesDisponibles[randomIndex];
            } else {
                uint256 randomIndex = _getRandomNumber(
                    objetosDisponibles.length,
                    i
                );
                cardIds[i] = objetosDisponibles[randomIndex];
            }
        }
        return cardIds;
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
    function addCardsSet(
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

    function setCardURI(
        uint256 cardId,
        uint8 rarity,
        string calldata uri
    ) external onlyOwner {
        _cardURIs[cardId][rarity] = uri;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        Card memory card = cards[tokenId];
        string memory uri = _cardURIs[card.cardId][card.rarity];
        require(bytes(uri).length > 0, "ERC721Metadata: URI not set for token");

        return uri;
    }
}
