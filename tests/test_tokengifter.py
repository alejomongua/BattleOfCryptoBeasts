import pytest
from brownie import TokenGifter, CryptoBeastsCoin, accounts


@pytest.fixture
@pytest.fixture
def setup():
    # Assign wallets
    owner = accounts[0]
    reserves = accounts[2]
    user = accounts[3]

    # Deploy contracts
    token = CryptoBeastsCoin.deploy(reserves, {"from": owner})

    # Distribute tokens
    gifter = TokenGifter.deploy(token.address, {'from': owner})
    token.transfer(gifter.address, 1000 * 10**18, {'from': reserves})

    return {
        "owner": owner,
        'user': user,
        "reserves": reserves,
        "token": token,
        "gifter": gifter,
    }


def test_gift_tokens(setup):
    owner = setup["owner"]
    token = setup["token"]
    gifter = setup["gifter"]
    recipient = setup['user']

    # Regalar tokens
    gifter.giftTokens(recipient.address, {'from': owner})

    # Verificar que los tokens fueron regalados correctamente
    assert token.balanceOf(recipient.address) == 400 * 10**18
    assert gifter.giftedAmounts(recipient.address) == 400 * 10**18


def test_gift_tokens_twice(setup):
    owner = setup["owner"]
    gifter = setup["gifter"]
    recipient = setup['user']

    # Regalar tokens
    gifter.giftTokens(recipient.address, {'from': owner})

    # Intentar regalar tokens de nuevo
    tx = gifter.giftTokens(recipient.address, {'from': owner})

    # Verificar que la transacción falló
    assert 'La billetera ya ha recibido la cantidad máxima de tokens' in tx.info['error']


def test_withdraw_all(setup):
    owner = setup["owner"]
    token = setup["token"]
    gifter = setup["gifter"]

    # Retirar todos los tokens
    gifter.withdrawAll({'from': owner})

    # Verificar que todos los tokens fueron retirados
    assert token.balanceOf(gifter.address) == 0
    assert token.balanceOf(owner) == token.totalSupply()
