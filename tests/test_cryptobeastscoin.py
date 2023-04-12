import pytest
from brownie import CryptoBeastsCoin, ReentrancyAttack, accounts, reverts, exceptions

INITIAL_SUPPLY = 100_000_000 * 10**18
INITIAL_FOUNDERS_ALLOCATION = INITIAL_SUPPLY * 0.1
INITIAL_RESERVES_ALLOCATION = INITIAL_SUPPLY * 0.2
INITIAL_REWARDS_ALLOCATION = INITIAL_SUPPLY * 0.7


@pytest.fixture
def reserves_address():
    return accounts[4]


def test_initial_supply(reserves_address):
    account = accounts[0]
    game_token = CryptoBeastsCoin.deploy(reserves_address, {'from': account})

    initial_supply = game_token.totalSupply()

    assert initial_supply == INITIAL_SUPPLY


def test_transfer(reserves_address):
    owner = accounts[0]
    account2 = accounts[1]
    amount = 1000 * 10**18

    game_token = CryptoBeastsCoin.deploy(reserves_address, {'from': owner})
    game_token.transfer(account2, amount, {'from': owner})

    account2_balance = game_token.balanceOf(account2)

    assert account2_balance == amount


def test_insufficient_balance(reserves_address):
    owner = accounts[0]
    account2 = accounts[1]
    amount = 1000 * 10**18

    game_token = CryptoBeastsCoin.deploy(reserves_address, {'from': owner})
    with pytest.raises(exceptions.VirtualMachineError):
        game_token.transfer(owner, amount, {'from': account2})

    account2_balance = game_token.balanceOf(account2)

    assert account2_balance == 0


def test_allowance_and_transfer_from(reserves_address):
    owner = accounts[0]
    spender = accounts[1]
    receiver = accounts[2]
    allowance = 1000 * 10**18

    game_token = CryptoBeastsCoin.deploy(reserves_address, {'from': owner})

    game_token.approve(spender, allowance, {'from': owner})

    spender_allowance = game_token.allowance(owner, spender)
    assert spender_allowance == allowance

    game_token.transferFrom(owner, receiver,
                            allowance, {'from': spender})
    receiver_balance = game_token.balanceOf(receiver)

    assert receiver_balance == allowance


def test_initial_allocation(reserves_address):
    owner = accounts[0]
    game_token = CryptoBeastsCoin.deploy(reserves_address, {'from': owner})

    founder_balance = game_token.balanceOf(owner)
    reserves_balance = game_token.balanceOf(reserves_address)
    rewards_balance = game_token.rewardsPool()

    assert founder_balance == INITIAL_FOUNDERS_ALLOCATION
    assert reserves_balance == INITIAL_RESERVES_ALLOCATION
    assert rewards_balance == INITIAL_REWARDS_ALLOCATION


def test_update_player_rewards(reserves_address):
    owner = accounts[0]
    player = accounts[1]
    game_token = CryptoBeastsCoin.deploy(reserves_address, {'from': owner})

    rewards_amount = 1000 * 10**18
    game_token.updatePlayerRewards(player, rewards_amount, {'from': owner})

    player_rewards = game_token.pendingRewards(player)

    assert player_rewards == rewards_amount


def test_update_multiple_player_rewards(reserves_address):
    owner = accounts[0]
    players = accounts[1:4]
    game_token = CryptoBeastsCoin.deploy(reserves_address, {'from': owner})

    rewards_amounts = [1000 * 10**18, 2000 * 10**18, 1500 * 10**18]
    game_token.updateMultiplePlayerRewards(
        players, rewards_amounts, {'from': owner})

    for i, player in enumerate(players):
        assert game_token.pendingRewards(player) == rewards_amounts[i]


def test_claim_rewards(reserves_address):
    owner = accounts[0]
    player = accounts[1]
    game_token = CryptoBeastsCoin.deploy(reserves_address, {'from': owner})

    rewards_amount = 1000 * 10**18
    game_token.updatePlayerRewards(player, rewards_amount, {'from': owner})
    game_token.claimRewards({'from': player})

    player_balance = game_token.balanceOf(player)

    assert player_balance == rewards_amount
    assert game_token.pendingRewards(player) == 0


def test_only_owner_can_update_rewards(reserves_address):
    owner = accounts[0]
    non_owner = accounts[1]
    player = accounts[2]
    game_token = CryptoBeastsCoin.deploy(reserves_address, {'from': owner})

    rewards_amount = 1000 * 10**18

    with reverts("Ownable: caller is not the owner"):
        game_token.updatePlayerRewards(
            player, rewards_amount, {'from': non_owner})

    with reverts("Ownable: caller is not the owner"):
        game_token.updateMultiplePlayerRewards(
            [player], [rewards_amount], {'from': non_owner})


def test_rewards_update_not_exceed_pool(reserves_address):
    owner = accounts[0]
    player = accounts[1]
    game_token = CryptoBeastsCoin.deploy(reserves_address, {'from': owner})

    rewards_amount = game_token.rewardsPool() + 1
    with pytest.raises(exceptions.VirtualMachineError):
        game_token.updatePlayerRewards(player, rewards_amount, {'from': owner})


def test_reentrancy_attack(reserves_address):
    # Asignar algunas recompensas al atacante
    owner = accounts[0]
    attacker = accounts[1]
    rewards_amount = 10 * 10**18
    game_token = CryptoBeastsCoin.deploy(reserves_address, {'from': owner})
    game_token.updatePlayerRewards(
        attacker, rewards_amount, {'from': accounts[0]})

    # Implementar el contrato de ataque y comenzar el ataque
    reentrancy_attack = ReentrancyAttack.deploy(game_token, {'from': attacker})
    game_token.updatePlayerRewards(
        reentrancy_attack, rewards_amount, {'from': accounts[0]})
    reentrancy_attack.startAttack({'from': attacker})

    # Verificar si el ataque fue exitoso
    stolen_rewards = reentrancy_attack.initialRewards(
    ) - game_token.pendingRewards(attacker)
    assert stolen_rewards <= rewards_amount, "Reentrancy attack was successful"
