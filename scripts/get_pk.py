from brownie import accounts


def main():
    dev = accounts.load('rinkeby_account')
    print(dev.private_key)
