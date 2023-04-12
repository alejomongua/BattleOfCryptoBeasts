import pytest
from brownie import CryptoBeastsMarketplace, CryptoBeastsNFT, \
    CryptoBeastsCoin, accounts, reverts


@pytest.fixture
def founders_address():
    return accounts[5]


@pytest.fixture
def reserves_address():
    return accounts[4]


@pytest.fixture
def game_token_contract(founders_address, reserves_address):
    return accounts[0].deploy(CryptoBeastsCoin, founders_address, reserves_address)


@pytest.fixture
def token_contract(game_token_contract):
    return accounts[0].deploy(CryptoBeastsNFT, game_token_contract.address)


@pytest.fixture
def marketplace_contract(token_contract, game_token_contract):
    return accounts[0].deploy(CryptoBeastsMarketplace, token_contract.address,
                              game_token_contract.address)


def test_marketplace_commission(token_contract, game_token_contract,
                                marketplace_contract):
    tokenId = 1
    price = 1000
    commission_rate = 5
    commission = price * commission_rate // 100

    # Mint a new token and transfer it to account[1]
    token_contract.mint(accounts[1], tokenId)
    token_contract.transfer(accounts[1], tokenId, {
        "from": accounts[0]
    })

    # Approve marketplace contract to manage the token
    token_contract.approve(marketplace_contract,
                           tokenId, {"from": accounts[1]})

    # List the token for sale
    marketplace_contract.list_token(tokenId, price, {
        "from": accounts[1]
    })

    # Account[2] buys the token
    game_token_contract.mint(accounts[2], price)
    game_token_contract.approve(
        marketplace_contract, price, {"from": accounts[2]})
    marketplace_contract.buy_token(tokenId, {
        "from": accounts[2]
    })

    # Check the new owner of the token
    assert token_contract.ownerOf(tokenId) == accounts[2]

    # Check the commission balance
    assert game_token_contract.balanceOf(marketplace_contract) == commission


def test_withdraw_commission(token_contract, game_token_contract,
                             marketplace_contract):
    tokenId = 1
    price = 1000
    commission_rate = 5
    commission = price * commission_rate // 100

    # Mint a new token and transfer it to account[1]
    token_contract.mint(accounts[1], tokenId)
    token_contract.transfer(accounts[1], tokenId, {"from": accounts[0]})

    # Approve marketplace contract to manage the token
    token_contract.approve(marketplace_contract,
                           tokenId, {"from": accounts[1]})

    # List the token for sale
    marketplace_contract.list_token(tokenId, price, {"from": accounts[1]})

    # Account[2] buys the token
    game_token_contract.mint(accounts[2], price)
    game_token_contract.approve(
        marketplace_contract, price, {"from": accounts[2]})
    marketplace_contract.buy_token(tokenId, {"from": accounts[2]})

    # Owner withdraws commission
    initial_balance = game_token_contract.balanceOf(accounts[0])
    marketplace_contract.withdrawCommission({"from": accounts[0]})

    # Check the owner's balance after withdrawing commission
    assert game_token_contract.balanceOf(
        accounts[0]) == initial_balance + commission


def test_only_owner_can_withdraw_commission(token_contract, game_token_contract,
                                            marketplace_contract):
    tokenId = 1
    price = 1000
    commission_rate = 5
    commission = price * commission_rate // 100

    # Mint a new token and transfer it to account[1]
    token_contract.mint(accounts[1], tokenId)
    token_contract.transfer(accounts[1], tokenId, {"from": accounts[0]})

    # Approve marketplace contract to manage the token
    token_contract.approve(marketplace_contract,
                           tokenId, {"from": accounts[1]})

    # List the token for sale
    marketplace_contract.list_token(tokenId, price, {"from": accounts[1]})

    # Account[2] buys the token
    game_token_contract.mint(accounts[2], price)
    game_token_contract.approve(
        marketplace_contract, price, {"from": accounts[2]})
    marketplace_contract.buy_token(tokenId, {"from": accounts[2]})

    # Non-owner account[3] attempts to withdraw commission
    with pytest.raises(Exception):
        marketplace_contract.withdrawCommission({"from": accounts[3]})

    # Check the commission balance is still in the contract
    assert game_token_contract.balanceOf(marketplace_contract) == commission


def test_offer_token(game_token_contract, token_contract):
    # Define the initial setup
    account = accounts[0]
    tokenId = 1
    offer_price = 1000
    marketplace = CryptoBeastsMarketplace.deploy(
        token_contract.address, game_token_contract.address, {'from': account})

    # Mint a token and approve marketplace to manage it
    token_contract.mint(account, tokenId, {'from': account})
    token_contract.setApprovalForAll(
        marketplace.address, True, {'from': account})

    # Offer the token in the marketplace
    tx = marketplace.offerToken(tokenId, offer_price, {'from': account})

    # Check if the token is offered in the marketplace
    offer = marketplace.tokenIdToOffer(tokenId)

    assert offer["isForSale"] == True
    assert offer["tokenId"] == tokenId
    assert offer["seller"] == account
    assert offer["price"] == offer_price


def test_buy_token(game_token_contract, token_contract):
    # Define the initial setup
    seller = accounts[0]
    buyer = accounts[1]
    tokenId = 1
    offer_price = 1000
    token_amount = 10000

    # Deploy the marketplace contract
    marketplace = CryptoBeastsMarketplace.deploy(
        token_contract.address, game_token_contract.address, {'from': seller})

    # Mint a token and approve marketplace to manage it
    token_contract.mint(seller, tokenId, {'from': seller})
    token_contract.setApprovalForAll(
        marketplace.address, True, {'from': seller})

    # Offer the token in the marketplace
    marketplace.offerToken(tokenId, offer_price, {'from': seller})

    # Mint tokens for the buyer
    game_token_contract.mint(buyer, token_amount, {'from': seller})
    game_token_contract.approve(
        marketplace.address, token_amount, {'from': buyer})

    # Buy the token
    tx = marketplace.buyToken(tokenId, {'from': buyer})

    # Check if the token has been transferred to the buyer
    assert token_contract.ownerOf(tokenId) == buyer

    # Check if the offer has been removed from the marketplace
    offer = marketplace.tokenIdToOffer(tokenId)
    assert offer["isForSale"] == False


def test_cannot_buy_token_for_lower_price(game_token_contract, token_contract):
    # Define the initial setup
    seller = accounts[0]
    buyer = accounts[1]
    tokenId = 1
    offer_price = 1000
    insufficient_amount = 500

    # Deploy the marketplace contract
    marketplace = CryptoBeastsMarketplace.deploy(
        token_contract.address, game_token_contract.address, {'from': seller})

    # Mint a token and approve marketplace to manage it
    token_contract.mint(seller, tokenId, {'from': seller})
    token_contract.setApprovalForAll(
        marketplace.address, True, {'from': seller})

    # Offer the token in the marketplace
    marketplace.offerToken(tokenId, offer_price, {'from': seller})

    # Mint tokens for the buyer
    game_token_contract.mint(buyer, insufficient_amount, {'from': seller})
    game_token_contract.approve(
        marketplace.address, insufficient_amount, {'from': buyer})

    # Attempt to buy the token with insufficient funds
    with reverts("The offered price is lower than the seller's price."):
        marketplace.buyToken(
            tokenId, {'from': buyer, 'value': insufficient_amount})


def test_cannot_offer_non_owned_token(game_token_contract, token_contract):
    # Define the initial setup
    owner = accounts[0]
    non_owner = accounts[1]
    tokenId = 1
    offer_price = 1000

    # Deploy the marketplace contract
    marketplace = CryptoBeastsMarketplace.deploy(
        token_contract.address, game_token_contract.address, {'from': owner})

    # Mint a token for the owner
    token_contract.mint(owner, tokenId, {'from': owner})

    # Attempt to offer the token in the marketplace by a non-owner
    with reverts("The token does not belong to the seller."):
        marketplace.offerToken(tokenId, offer_price, {'from': non_owner})
