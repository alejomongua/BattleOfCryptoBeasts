import json
import os
import dotenv
import requests
from brownie import CryptoBeastsCoin, CryptoBeastsNFT, \
    CryptoBeastsMarketplace, accounts, network
from requests.auth import HTTPBasicAuth

INFURA_PROJECT_ID = os.getenv('INFURA_API_KEY')
INFURA_PROJECT_SECRET = os.getenv('INFURA_API_SECRET')
IPFS_URIS_PATH = 'ipfs_uris.json'


def cards_data():
    # Images are in the images/folder
    # Comunes are rarity 1
    # Raras are rarity 2
    # Legendarias are rarity 3

    prefix = {
        1: 'images/Comunes/',
        2: 'images/Raras/',
        3: 'images/Legendarias/'
    }

    cards = {}

    # Iterate over files in the images folder
    for rarity, prefix_path in prefix.items():
        for file in os.listdir(prefix_path):
            if file.endswith('.png'):
                card_id = file.split('.')[0]
                if card_id in cards:
                    cards[card_id][rarity] = prefix_path + file
                else:
                    cards[card_id] = {rarity: prefix_path + file}

    return cards


def main():
    dev = accounts.load('rinkeby_account')
    deploy_contracts(dev)


def upload_to_ipfs(file_path):
    url = f'https://ipfs.infura.io:5001/api/v0/add'
    auth = HTTPBasicAuth(INFURA_PROJECT_ID, INFURA_PROJECT_SECRET)

    params = {
        'pin': 'true',
        'cid-version': '1'
    }

    with open(file_path, 'rb') as file:
        files = {'file': file}
        response = requests.post(url, params=params, files=files, auth=auth)

    if response.status_code == 200:
        result = json.loads(response.text)
        return result['Hash']
    else:
        raise Exception(f'Error uploading file to IPFS: {response.text}')


def deploy_contracts(dev):
    # Load wallet address from environment variable
    dotenv.load_dotenv()

    reserves_address = os.getenv('RESERVES_ACCOUNT')
    # Desplegar el token ERC20
    cryptobeastscoin = CryptoBeastsCoin.deploy(
        reserves_address, {'from': dev}, publish_source=True)

    # Desplegar el token ERC721
    cryptobeastsnft = CryptoBeastsNFT.deploy(
        cryptobeastscoin.address, {'from': dev}, publish_source=True)

    # Check if there is already a ipfs_uris data in file
    if os.path.exists(IPFS_URIS_PATH):
        with open(IPFS_URIS_PATH, 'r') as file:
            ipfs_uris = json.load(file)
    else:
        ipfs_uris = {}

    for card_id, rarity_data in cards_data().items():
        for rarity, image_path in rarity_data.items():
            if card_id in ipfs_uris and rarity in ipfs_uris[card_id]:
                ipfs_uri = ipfs_uris[card_id][rarity]
            else:
                ipfs_hash = upload_to_ipfs(image_path)
                ipfs_uri = f'https://ipfs.io/ipfs/{ipfs_hash}'
                print(f'Uploaded card {card_id} :: {rarity} -- {ipfs_uri}')
                if card_id in ipfs_uris:
                    ipfs_uris[card_id][rarity] = ipfs_uri
                else:
                    ipfs_uris[card_id] = {
                        rarity: ipfs_uri
                    }
            cryptobeastsnft.setCardURI(
                card_id, rarity, ipfs_uri, {'from': dev})

    # Save ipfs hashes
    with open(IPFS_URIS_PATH, 'w') as file:
        json.dump(ipfs_uris, file)

    # Desplegar el CryptoBeastsMarketplace
    percentage_fee = 10
    CryptoBeastsmarketplace = CryptoBeastsMarketplace.deploy(
        cryptobeastscoin.address, cryptobeastsnft.address, percentage_fee,
        {'from': dev}, publish_source=True)

    print(f"Token ERC20 desplegado en: {cryptobeastscoin.address}")
    print(f"Token ERC721 desplegado en: {cryptobeastsnft.address}")
    print(
        f"CryptoBeastsMarketplace desplegado en: {CryptoBeastsmarketplace.address}")
