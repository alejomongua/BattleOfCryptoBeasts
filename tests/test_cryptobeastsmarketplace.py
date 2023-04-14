import pytest
from brownie import CryptoBeastsNFT, CryptoBeastsCoin, CryptoBeastsMarketplace, accounts, exceptions

# Configuración inicial


@pytest.fixture
def setup():
    owner = accounts[0]
    user1 = accounts[1]
    user2 = accounts[2]
    reserves = accounts[3]

    # Deploy contracts
    payment_token = CryptoBeastsCoin.deploy(reserves, {"from": owner})
    nft_contract = CryptoBeastsNFT.deploy(
        payment_token.address, {"from": owner})

    # Distribute tokens
    reserves_stock = payment_token.balanceOf(reserves)
    payment_token.transfer(user1, reserves_stock * 0.2, {"from": reserves})
    payment_token.transfer(user2, reserves_stock * 0.2, {"from": reserves})
    # Aprove funds
    user1_funds = payment_token.balanceOf(user1)
    user2_funds = payment_token.balanceOf(user2)
    payment_token.approve(nft_contract, user1_funds, {"from": user1})
    payment_token.approve(nft_contract, user2_funds, {"from": user2})

    marketplace = CryptoBeastsMarketplace.deploy(
        payment_token.address, nft_contract.address, 5, {"from": owner})

    return {
        "owner": owner,
        "user1": user1,
        "user2": user2,
        "marketplace": marketplace,
        "payment_token": payment_token,
        "nft_contract": nft_contract
    }


def test_create_offer(setup):
    price = 100 * 10 ** 18

    setup["nft_contract"].buyBoosterPack(1, {'from': setup["user1"]})

    tokenId = setup['nft_contract'].tokenOfOwnerByIndex(setup['user1'], 0)
    setup["nft_contract"].approve(setup["marketplace"], tokenId, {
                                  "from": setup["user1"]})
    setup["marketplace"].createTokenOffer(
        tokenId, price, {"from": setup["user1"]})

    offer = setup["marketplace"].getTokenOffer(tokenId)

    assert offer["isForSale"] is True
    assert offer["price"] == price
    assert offer["seller"] == setup["user1"]


def test_cancel_offer(setup):
    tokenId = 2
    price = 100 * 10 ** 18

    setup["nft_contract"].buyBoosterPack(1, {'from': setup["user1"]})

    tokenId = setup['nft_contract'].tokenOfOwnerByIndex(setup['user1'], 0)
    setup["nft_contract"].approve(setup["marketplace"], tokenId, {
                                  "from": setup["user1"]})
    setup["marketplace"].createTokenOffer(
        tokenId, price, {"from": setup["user1"]})
    setup["marketplace"].cancelTokenOffer(tokenId, {"from": setup["user1"]})

    offer = setup["marketplace"].getTokenOffer(tokenId)

    assert offer["isForSale"] is False


def test_buy_token(setup):
    tokenId = 3
    price = 100 * 10 ** 18

    setup["nft_contract"].buyBoosterPack(1, {'from': setup["user1"]})

    tokenId = setup['nft_contract'].tokenOfOwnerByIndex(setup['user1'], 0)

    setup["nft_contract"].approve(setup["marketplace"], tokenId, {
        "from": setup["user1"]})
    setup["marketplace"].createTokenOffer(
        tokenId, price, {"from": setup["user1"]})

    setup["payment_token"].approve(setup["marketplace"], price, {
        "from": setup["user2"]})
    setup["marketplace"].buyToken(tokenId, {"from": setup["user2"]})

    newOwner = setup["nft_contract"].ownerOf(tokenId)
    offer = setup["marketplace"].getTokenOffer(tokenId)

    assert newOwner == setup["user2"]
    assert offer["isForSale"] is False


def test_create_offer_not_owner(setup):
    tokenId = 4
    price = 100 * 10 ** 18

    setup["nft_contract"].buyBoosterPack(1, {"from": setup["user1"]})

    tokenId = setup['nft_contract'].tokenOfOwnerByIndex(setup['user1'], 0)

    setup["nft_contract"].approve(setup["marketplace"], tokenId, {
        "from": setup["user1"]})

    with pytest.raises(Exception, match="Only the owner can create offers."):
        setup["marketplace"].createTokenOffer(
            tokenId, price, {"from": setup["user2"]})


def test_withdraw_fees_only_owner(setup):
    tokenId = 5
    price = 100 * 10 ** 18

    setup["nft_contract"].buyBoosterPack(1, {"from": setup["user1"]})

    tokenId = setup['nft_contract'].tokenOfOwnerByIndex(setup['user1'], 0)

    setup["nft_contract"].approve(setup["marketplace"], tokenId, {
                                  "from": setup["user1"]})
    setup["marketplace"].createTokenOffer(
        tokenId, price, {"from": setup["user1"]})

    setup["payment_token"].approve(setup["marketplace"], price, {
        "from": setup["user2"]})

    # Buy token
    setup["marketplace"].buyToken(tokenId, {"from": setup["user2"]})

    # Check initial owner balance
    initial_balance = setup["payment_token"].balanceOf(setup["owner"])

    # Owner withdraws fees
    setup["marketplace"].withdrawFees({"from": setup["owner"]})
    new_balance = setup["payment_token"].balanceOf(setup["owner"])

    assert new_balance > initial_balance

    # Non-owner tries to withdraw fees
    with pytest.raises(Exception, match="Ownable: caller is not the owner"):
        setup["marketplace"].withdrawFees({"from": setup["user1"]})
