import os
import dotenv
from brownie import CryptoBeastsCoin, CryptoBeastsNFT, \
    CryptoBeastsMarketplace, accounts, network


def main():
    dev = accounts.load('rinkeby_account')
    deploy_contracts(dev)


def deploy_contracts(dev):
    # Load wallet address from environment variable
    dotenv.load_dotenv()

    reserves_address = os.getenv('RESERVES_ACCOUNT')
    # Desplegar el token ERC20
    cryptobeastscoin = CryptoBeastsCoin.deploy(reserves_address, {'from': dev})

    # Desplegar el token ERC721
    cryptobeastsnft = CryptoBeastsNFT.deploy(
        cryptobeastscoin.address, {'from': dev})

    # Desplegar el CryptoBeastsMarketplace
    percentage_fee = 10
    CryptoBeastsmarketplace = CryptoBeastsMarketplace.deploy(
        cryptobeastscoin.address, cryptobeastsnft.address, percentage_fee, {'from': dev})

    print(f"Token ERC20 desplegado en: {cryptobeastscoin.address}")
    print(f"Token ERC721 desplegado en: {cryptobeastsnft.address}")
    print(
        f"CryptoBeastsMarketplace desplegado en: {CryptoBeastsmarketplace.address}")
