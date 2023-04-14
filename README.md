# Battle Of CryptoBeasts

Battle of CryptoBeasts is a PvP card game where you defy your friends or play against strangers just to have fun, you are not becoming rich by playing it.

This repository contains the smart contracts for the token (the coin), the game (the cards) and the marketplace (the shop).

It uses the [OpenZeppelin](https://openzeppelin.org/) framework for the smart contracts.

It also uses [Brownie](https://eth-brownie.readthedocs.io/en/stable/) for testing and deployment.

## Setup

Install the requirements:

```bash
pip install -r requirements.txt
```

Then you have to create a .env file using .env.example template

```bash
cp .env.example .env
```

Read the comments in the file to know what to do.

You also need to have OpenZeppelin insalled

```bash
brownie pm install OpenZeppelin/openzeppelin-contracts@4.8.2
```


## Testing

To run the tests, you need to have ganache-cli installed

```bash
npm install -g ganache-cli
```

To run the tests, execute

```bash
brownie test
```

## Deploy

To deploy, you can use:

```bash
brownie run deploy --network goerli
```

If you want to deploy on sepolia, you have to add it to brownie using

```bash
source .env
brownie networks add sepolia sepolia chainid=11155111  host="https://sepolia.infura.io/v3/$WEB3_INFURA_PROJECT_ID" \
  explorer="https://api-sepolia.etherscan.io/api"
```

To use deploy script as-is, you have to create an account called rinkeby_account using:

```bash
brownie accounts new rinkeby_account
```

Or you can edit the deploy script to use your own account.

## Acknowledgements

This is a work in progress by LAML, MAPV and GMVS. We are a group of grad students from the Universidad Nacional de Colombia.

