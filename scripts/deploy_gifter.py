from brownie import TokenGifter, accounts
import os


def main():
    # Obtén la cuenta del propietario
    owner = accounts.load('rinkeby_account')

    # La dirección del token CryptoBeastsCoin
    token_address = os.getenv('TOKEN_ADDRESS')

    # Despliega el contrato TokenGifter
    gifter = TokenGifter.deploy(token_address, {'from': owner})

    print(f"TokenGifter deployed at: {gifter.address}")
