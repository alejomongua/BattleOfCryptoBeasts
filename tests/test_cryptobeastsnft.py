import pytest
from brownie import CryptoBeastsNFT, CryptoBeastsCoin, accounts

# Configuración inicial
RANDOM_DECK_COST = 360 * 10 ** 18
BURN_REWARD = RANDOM_DECK_COST / 40 - 2 * 10 ** 18


@pytest.fixture
def setup():
    # Assign wallets
    owner = accounts[0]
    founders = accounts[1]
    reserves = accounts[2]
    user = accounts[3]

    # Deploy contracts
    payment_token = CryptoBeastsCoin.deploy(
        founders, reserves, {"from": owner})
    nft_contract = CryptoBeastsNFT.deploy(
        payment_token.address, {"from": owner})

    # Distribute tokens
    reserves_stock = payment_token.totalSupply() * 0.2
    payment_token.transfer(user, reserves_stock * 0.2, {"from": reserves})
    payment_token.transfer(owner, reserves_stock * 0.2, {"from": reserves})

    return {
        "owner": owner,
        "founders": founders,
        "reserves": reserves,
        "payment_token": payment_token,
        "nft_contract": nft_contract
    }


def test_initial_card_types(setup):
    nft_contract = setup["nft_contract"]

    initial_creature_cards = 21
    initial_ability_cards = 11
    initial_object_cards = 11

    # Comprueba si las cartas iniciales de criaturas están disponibles
    for i in range(initial_creature_cards):
        card_stock = nft_contract.cardStock(i * 3)
        assert card_stock == nft_contract.INITIAL_CARD_STOCK()

    # Comprueba si las cartas iniciales de habilidades están disponibles
    for i in range(initial_ability_cards):
        card_stock = nft_contract.cardStock(i * 3 + 1)
        assert card_stock == nft_contract.INITIAL_CARD_STOCK()

    # Comprueba si las cartas iniciales de objetos están disponibles
    for i in range(initial_object_cards):
        card_stock = nft_contract.cardStock(i * 3 + 2)
        assert card_stock == nft_contract.INITIAL_CARD_STOCK()


def test_buy_random_deck(setup):
    owner = setup["owner"]
    payment_token = setup["payment_token"]
    nft_contract = setup["nft_contract"]
    buyer = accounts[1]

    # Transfiere tokens de pago suficientes al comprador
    payment_token.transfer(buyer, RANDOM_DECK_COST, {"from": owner})

    # Aprobar la transferencia de tokens al contrato NFT
    payment_token.approve(nft_contract.address,
                          RANDOM_DECK_COST, {"from": buyer})

    # Comprar baraja aleatoria
    initial_balance = payment_token.balanceOf(buyer)
    tx = nft_contract.buyRandomDeck({"from": buyer})
    new_balance = payment_token.balanceOf(buyer)

    # Comprueba si el saldo del comprador disminuyó correctamente
    assert new_balance == initial_balance - RANDOM_DECK_COST

    # Comprueba si se emitieron correctamente los eventos "Transfer" con los tokenId emitidos
    transfer_events = tx.events["Transfer"]

    # Asegúrate de que se hayan emitido 40 cartas en total
    assert len(transfer_events) == 40

    card_counts = {1: 0, 2: 0, 3: 0}

    for event in transfer_events:
        assert event["to"] == buyer
        minted_token_id = event["tokenId"]

        # Comprueba si la carta minteada tiene un cardId válido
        card = nft_contract.cards(minted_token_id)
        card_type = card["cardType"]
        assert card_type in card_counts
        card_counts[card_type] += 1

    # Comprueba si se emitieron 20 cartas de criatura, 10 de habilidad y 10 de objeto
    assert card_counts[1] == 20
    assert card_counts[2] == 10
    assert card_counts[3] == 10

    # Intenta comprar una baraja sin suficientes tokens y comprueba si falla
    with pytest.raises(Exception):
        nft_contract.buyRandomDeck({"from": accounts[2]})


def test_burn_card(setup):
    owner = setup["owner"]
    payment_token = setup["payment_token"]
    nft_contract = setup["nft_contract"]
    buyer = accounts[1]

    # Transfiere tokens de pago suficientes al comprador para comprar una carta específica
    payment_token.transfer(buyer, BURN_REWARD, {"from": owner})

    # Aprobar la transferencia de tokens al contrato NFT
    payment_token.approve(nft_contract.address, BURN_REWARD, {"from": buyer})

    # Comprar carta específica
    nft_contract.buySpecificCard(1, 1, {"from": buyer})

    # Obtiene el tokenId de la carta comprada
    tokenId = nft_contract.tokenOfOwnerByIndex(buyer, 0)

    # Quemar la carta
    initial_payment_token_balance = payment_token.balanceOf(buyer)
    nft_contract.burn(tokenId, {"from": buyer})
    final_payment_token_balance = payment_token.balanceOf(buyer)

    # Comprueba si el saldo del comprador aumentó correctamente
    assert final_payment_token_balance == initial_payment_token_balance + BURN_REWARD

    # Comprueba si la carta ya no pertenece al comprador
    with pytest.raises(Exception):
        nft_contract.tokenOfOwnerByIndex(buyer, 0)

    # Intenta quemar una carta que no pertenece al comprador y comprueba si falla
    with pytest.raises(Exception):
        nft_contract.burn(1000, {"from": accounts[2]})


def test_withdraw(setup):
    owner = setup["owner"]
    payment_token = setup["payment_token"]
    nft_contract = setup["nft_contract"]
    buyer = accounts[1]

    # Transfiere tokens de pago suficientes al comprador para comprar una carta específica
    payment_token.transfer(buyer, BURN_REWARD, {"from": owner})

    # Aprobar la transferencia de tokens al contrato NFT
    payment_token.approve(nft_contract.address, BURN_REWARD, {"from": buyer})

    # Comprar carta específica
    nft_contract.buySpecificCard(1, 1, {"from": buyer})

    # Comprobar el saldo inicial del propietario de los tokens de pago
    initial_owner_balance = payment_token.balanceOf(owner)

    # Retirar fondos del contrato
    nft_contract.withdraw({"from": owner})

    # Comprobar si el saldo del propietario aumentó correctamente
    final_owner_balance = payment_token.balanceOf(owner)
    assert final_owner_balance == initial_owner_balance + BURN_REWARD

    # Intenta retirar fondos del contrato por alguien que no sea el propietario y comprueba si falla
    with pytest.raises(Exception):
        nft_contract.withdraw({"from": accounts[2]})


def test_add_card_set(setup):
    owner = setup["owner"]
    nft_contract = setup["nft_contract"]

    # Crea un nuevo conjunto de cartas
    new_creature_cards = 5
    new_ability_cards = 3
    new_object_cards = 3
    new_set_stock = 1000

    nft_contract.addCardSet(new_creature_cards, new_ability_cards,
                            new_object_cards, new_set_stock, {"from": owner})

    # Comprueba si las nuevas cartas se agregaron correctamente
    current_creature_count = nft_contract.currentCreatureCount()
    current_ability_count = nft_contract.currentAbilityCount()
    current_object_count = nft_contract.currentObjectCount()

    assert current_creature_count == 21 + new_creature_cards
    assert current_ability_count == 11 + new_ability_cards
    assert current_object_count == 11 + new_object_cards

    # Comprueba si el stock de las nuevas cartas se estableció correctamente
    for i in range(new_creature_cards):
        card_stock = nft_contract.cardStock((21 + i) * 3)
        assert card_stock == new_set_stock

    for i in range(new_ability_cards):
        card_stock = nft_contract.cardStock((11 + i) * 3 + 1)
        assert card_stock == new_set_stock

    for i in range(new_object_cards):
        card_stock = nft_contract.cardStock((11 + i) * 3 + 2)
        assert card_stock == new_set_stock

    # Intenta agregar un nuevo conjunto de cartas por alguien que no sea el propietario y comprueba si falla
    with pytest.raises(Exception):
        nft_contract.addCardSet(1, 1, 1, 1000, {"from": accounts[2]})
