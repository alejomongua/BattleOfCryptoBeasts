import pytest
from brownie import CryptoBeastsNFT, CryptoBeastsCoin, accounts, exceptions

# Configuración inicial
BOOSTER_PACK_COST = 50 * 10 ** 18
BURN_REWARD = 7 * 10 ** 18

INITIAL_CARD_STOCK = 100_000


@pytest.fixture
def setup():
    # Assign wallets
    owner = accounts[0]
    reserves = accounts[2]
    user = accounts[3]

    # Deploy contracts
    payment_token = CryptoBeastsCoin.deploy(reserves, {"from": owner})
    nft_contract = CryptoBeastsNFT.deploy(
        payment_token.address, {"from": owner})

    # Distribute tokens
    reserves_stock = payment_token.balanceOf(reserves)
    payment_token.transfer(user, reserves_stock * 0.2, {"from": reserves})
    payment_token.transfer(owner, reserves_stock * 0.2, {"from": reserves})

    return {
        "owner": owner,
        'user': user,
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
        assert card_stock == INITIAL_CARD_STOCK

    # Comprueba si las cartas iniciales de habilidades están disponibles
    for i in range(initial_ability_cards):
        card_stock = nft_contract.cardStock(i * 3 + 1)
        assert card_stock == INITIAL_CARD_STOCK

    # Comprueba si las cartas iniciales de objetos están disponibles
    for i in range(initial_object_cards):
        card_stock = nft_contract.cardStock(i * 3 + 2)
        assert card_stock == INITIAL_CARD_STOCK


def test_buy_booster_pack(setup):
    owner = setup["owner"]
    payment_token = setup["payment_token"]
    nft_contract = setup["nft_contract"]
    buyer = setup['user']

    # Aprobar la transferencia de tokens al contrato NFT
    payment_token.approve(nft_contract.address,
                          BOOSTER_PACK_COST, {"from": buyer})

    # Comprar baraja aleatoria
    card_type = 1
    initial_balance = payment_token.balanceOf(buyer)
    tx = nft_contract.buyBoosterPack(card_type, {"from": buyer})
    new_balance = payment_token.balanceOf(buyer)

    # Comprueba si el saldo del comprador disminuyó correctamente
    assert new_balance == initial_balance - BOOSTER_PACK_COST

    # Comprueba si se emitieron correctamente los eventos "Transfer" con los tokenId emitidos
    transfer_events = tx.events["Transfer"]

    # Asegúrate de que se hayan emitido 40 cartas en total
    # El evento transfer adicional es la aprobación de la transferencia del token ERC20
    assert len(transfer_events) == 5 + 1

    card_counts = {1: 0, 2: 0, 3: 0}

    for event in transfer_events:
        if event["from"] != "0x0000000000000000000000000000000000000000":
            continue
        assert event["to"] == buyer
        card_id = nft_contract.cards(event["tokenId"])["cardId"]
        assert card_id % 3 == card_type - 1

    # Intenta comprar una baraja sin suficientes tokens y comprueba si falla
    with pytest.raises(exceptions.VirtualMachineError):
        nft_contract.buyBoosterPack(1, {"from": accounts[2]})


def test_burn_card(setup):
    owner = setup["owner"]
    payment_token = setup["payment_token"]
    nft_contract = setup["nft_contract"]
    account2 = setup['user']
    buyer = accounts[1]

    # Transfiere tokens de pago suficientes al comprador para comprar una carta específica
    payment_token.transfer(buyer, BOOSTER_PACK_COST, {"from": owner})

    # Aprobar la transferencia de tokens al contrato NFT
    payment_token.approve(nft_contract.address,
                          BOOSTER_PACK_COST, {"from": buyer})

    # Comprar booster pack
    nft_contract.buyBoosterPack(1, {"from": buyer})

    # Obtiene el tokenId de la carta comprada
    tokenId = nft_contract.tokenOfOwnerByIndex(buyer, 0)

    # Quemar la carta
    initial_payment_token_balance = payment_token.balanceOf(buyer)
    nft_contract.burn(tokenId, {"from": buyer})
    final_payment_token_balance = payment_token.balanceOf(buyer)

    # Comprueba si el saldo del comprador aumentó correctamente
    assert final_payment_token_balance == initial_payment_token_balance + BURN_REWARD

    # Comprueba si la carta ya no pertenece al comprador
    with pytest.raises(exceptions.VirtualMachineError):
        nft_contract.ownerOf(tokenId)

    # Intenta quemar una carta que no pertenece al comprador y comprueba si falla
    payment_token.approve(nft_contract.address,
                          BOOSTER_PACK_COST, {"from": account2})
    nft_contract.buyBoosterPack(1, {"from": account2})
    tokenId2 = nft_contract.tokenOfOwnerByIndex(account2, 0)

    with pytest.raises(exceptions.VirtualMachineError):
        nft_contract.burn(tokenId2, {"from": buyer})


def test_withdraw(setup):
    owner = setup["owner"]
    payment_token = setup["payment_token"]
    nft_contract = setup["nft_contract"]
    buyer = accounts[1]

    # Transfiere tokens de pago suficientes al comprador para comprar una carta específica
    payment_token.transfer(buyer, BOOSTER_PACK_COST, {"from": owner})

    # Aprobar la transferencia de tokens al contrato NFT
    payment_token.approve(nft_contract.address,
                          BOOSTER_PACK_COST, {"from": buyer})

    # Comprar carta específica
    nft_contract.buyBoosterPack(1, {"from": buyer})

    # Comprobar el saldo inicial del propietario de los tokens de pago
    initial_owner_balance = payment_token.balanceOf(owner)

    # Retirar fondos del contrato
    nft_contract.withdraw({"from": owner})

    # Comprobar si el saldo del propietario aumentó correctamente
    final_owner_balance = payment_token.balanceOf(owner)
    assert final_owner_balance == initial_owner_balance + BOOSTER_PACK_COST

    # Intenta retirar fondos del contrato por alguien que no sea el propietario y comprueba si falla
    with pytest.raises(exceptions.VirtualMachineError):
        nft_contract.withdraw({"from": accounts[2]})


def test_add_card_set(setup):
    owner = setup["owner"]
    nft_contract = setup["nft_contract"]

    # Crea un nuevo conjunto de cartas
    new_creature_cards = 5
    new_ability_cards = 3
    new_object_cards = 3
    new_set_stock = 1000

    nft_contract.addCardsSet(new_creature_cards, new_ability_cards,
                             new_object_cards, new_set_stock, {"from": owner})

    # Comprueba si las nuevas cartas se agregaron correctamente
    current_creature_count = nft_contract.totalCriaturas()
    current_ability_count = nft_contract.totalHabilidades()
    current_object_count = nft_contract.totalObjetos()

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
    with pytest.raises(exceptions.VirtualMachineError):
        nft_contract.addCardsSet(1, 1, 1, 1000, {"from": accounts[2]})


def test_burn_limit(setup):
    owner = setup["owner"]
    nft_contract = setup["nft_contract"]
    payment_token = setup["payment_token"]
    initial_balance = nft_contract.balanceOf(owner)

    # Aprove funds
    payment_token.approve(nft_contract.address,
                          BOOSTER_PACK_COST * 10, {"from": owner})

    for i in range(10):
        nft_contract.buyBoosterPack(1, {'from': owner})
        tokenId = nft_contract.tokenOfOwnerByIndex(
            owner, initial_balance + i)
        nft_contract.burn(tokenId, {'from': owner})

    with pytest.raises(exceptions.VirtualMachineError):
        tokenId = nft_contract.tokenOfOwnerByIndex(
            owner, initial_balance + 10)
        nft_contract.burn(tokenId, {'from': owner})


def test_max_supply(setup):
    owner = setup["owner"]
    nft_contract = setup["nft_contract"]

    reached_max_supply = False

    while not reached_max_supply:
        try:
            nft_contract.buyBoosterPack(1, {'from': owner})
        except exceptions.VirtualMachineError:
            reached_max_supply = True
            break

    # Asegurar que se alcanzó el límite máximo de suministro
    assert reached_max_supply

    # Intentar comprar un mazo adicional y verificar que se lanza una excepción
    with pytest.raises(exceptions.VirtualMachineError):
        nft_contract.buyBoosterPack(1, {'from': owner})
