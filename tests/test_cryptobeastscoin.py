from brownie import CryptoBeastsCoin, accounts, reverts

# Random addresses
FOUNDER_ADDRESS = '0xf085fb227107f1997ae650a28970510711e948c5'
RESERVES_ADDRESS = '0x7fE3F77C0822e1DbE44184dF41EF6C9d4006ec5e'

INITIAL_SUPPLY = 100_000_000 * 10**18
INITIAL_FOUNDERS_ALLOCATION = INITIAL_SUPPLY * 0.1
INITIAL_RESERVES_ALLOCATION = INITIAL_SUPPLY * 0.2
INITIAL_REWARDS_ALLOCATION = INITIAL_SUPPLY * 0.7


def test_initial_supply():
    account = accounts[0]
    game_token = CryptoBeastsCoin.deploy({'from': account})

    initial_supply = game_token.totalSupply()

    assert initial_supply == INITIAL_SUPPLY


def test_transfer():
    account1 = accounts[0]
    account2 = accounts[1]
    amount = 1000 * 10**18

    game_token = CryptoBeastsCoin.deploy({'from': account1})
    game_token.transfer(account2, amount, {'from': account1})

    account2_balance = game_token.balanceOf(account2)

    assert account2_balance == amount


def test_insufficient_balance():
    account1 = accounts[0]
    account2 = accounts[1]
    amount = 1000 * 10**18

    game_token = CryptoBeastsCoin.deploy({'from': account1})
    game_token.transfer(account1, amount, {'from': account2})

    account1_balance = game_token.balanceOf(account1)

    assert account1_balance == 0


def test_allowance_and_transfer_from():
    owner = accounts[0]
    spender = accounts[1]
    receiver = accounts[2]
    allowance = 1000 * 10**18

    game_token = CryptoBeastsCoin.deploy({'from': owner})
    game_token.approve(spender, allowance, {'from': owner})

    spender_allowance = game_token.allowance(owner, spender)
    assert spender_allowance == allowance

    game_token.transferFrom(owner, receiver, allowance, {'from': spender})
    receiver_balance = game_token.balanceOf(receiver)

    assert receiver_balance == allowance


def test_initial_allocation():
    account = accounts[0]
    game_token = CryptoBeastsCoin.deploy(
        FOUNDER_ADDRESS, RESERVES_ADDRESS, {'from': account})

    founder_balance = game_token.balanceOf(FOUNDER_ADDRESS)
    reserves_balance = game_token.balanceOf(RESERVES_ADDRESS)
    rewards_balance = game_token.rewardsPool()

    assert founder_balance == INITIAL_FOUNDERS_ALLOCATION
    assert reserves_balance == INITIAL_RESERVES_ALLOCATION
    assert rewards_balance == INITIAL_REWARDS_ALLOCATION


def test_update_player_rewards():
    owner = accounts[0]
    player = accounts[1]
    game_token = CryptoBeastsCoin.deploy(
        FOUNDER_ADDRESS, RESERVES_ADDRESS, {'from': owner})

    rewards_amount = 1000 * 10**18
    game_token.updatePlayerRewards(player, rewards_amount, {'from': owner})

    player_rewards = game_token.pendingRewards(player)

    assert player_rewards == rewards_amount


def test_update_multiple_player_rewards():
    owner = accounts[0]
    players = accounts[1:4]
    game_token = CryptoBeastsCoin.deploy(
        FOUNDER_ADDRESS, RESERVES_ADDRESS, {'from': owner})

    rewards_amounts = [1000 * 10**18, 2000 * 10**18, 1500 * 10**18]
    game_token.updateMultiplePlayerRewards(
        players, rewards_amounts, {'from': owner})

    for i, player in enumerate(players):
        assert game_token.pendingRewards(player) == rewards_amounts[i]


def test_claim_rewards():
    owner = accounts[0]
    player = accounts[1]
    game_token = CryptoBeastsCoin.deploy(
        FOUNDER_ADDRESS, RESERVES_ADDRESS, {'from': owner})

    rewards_amount = 1000 * 10**18
    game_token.updatePlayerRewards(player, rewards_amount, {'from': owner})
    game_token.claimRewards({'from': player})

    player_balance = game_token.balanceOf(player)

    assert player_balance == rewards_amount
    assert game_token.pendingRewards(player) == 0


def test_only_owner_can_update_rewards():
    owner = accounts[0]
    non_owner = accounts[1]
    player = accounts[2]
    game_token = CryptoBeastsCoin.deploy(
        FOUNDER_ADDRESS, RESERVES_ADDRESS, {'from': owner})

    rewards_amount = 1000 * 10**18

    with reverts("Ownable: caller is not the owner"):
        game_token.updatePlayerRewards(
            player, rewards_amount, {'from': non_owner})

    with reverts("Ownable: caller is not the owner"):
        game_token.updateMultiplePlayerRewards(
            [player], [rewards_amount], {'from': non_owner})


def test_positive_rewards_update():
    owner = accounts[0]
    player = accounts[1]
    game_token = CryptoBeastsCoin.deploy(
        FOUNDER_ADDRESS, RESERVES_ADDRESS, {'from': owner})

    negative_rewards_amount = -1000 * 10**18

    with reverts("Rewards must be positive"):
        game_token.updatePlayerRewards(
            player, negative_rewards_amount, {'from': owner})

    with reverts("Rewards must be positive"):
        game_token.updateMultiplePlayerRewards(
            [player], [negative_rewards_amount], {'from': owner})

    def test_rewards_update_not_exceed_pool():
        owner = accounts[0]
        player = accounts[1]
        game_token = CryptoBeastsCoin.deploy(
            FOUNDER_ADDRESS, RESERVES_ADDRESS, {'from': owner})

    rewards_amount = 1000 * 10**18
    game_token.updatePlayerRewards(player, rewards_amount, {'from': owner})

    # Intenta reclamar más recompensas de las autorizadas
    excessive_rewards_amount = game_token.pendingRewards(player) + 1

    with reverts("Cannot claim more rewards than authorized"):
        game_token.claimRewards(
            {'from': player, 'value': excessive_rewards_amount})
