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

## How to Start Playing

The game is deployed on the Mumbai test network of Polygon, so it can be played for free.

### Step 1: Install Metamask

To play, you need to have [Metamask](https://metamask.io/) installed, a browser extension that allows you to interact with decentralized applications.

### Step 2: Add the Polygon Mumbai Test Network to Metamask

By default, Metamask operates on the Ethereum network, but it is compatible with other EVM-based networks, such as Polygon. To add the Polygon Mumbai test network to Metamask, you can follow the instructions shown in [this Datawallet blogpost](https://www.datawallet.com/crypto/add-polygon-mumbai-to-metamask).

### Step 3: Get MATIC Tokens

MATIC tokens from the Mumbai test network are essential to interact with the smart contract. You can get them at the [Mumbai faucet](https://faucet.matic.network/).

### Step 4: Get Game Tokens (CBC)

We have implemented a smart contract to gift CBC tokens that allow you to play the game. (pending, create an interface to request these tokens)

### Step 5: Buy Cards

Once you have CBC tokens, you can buy booster packs. You need at least 20 cards to be able to play.

### Step 6: Play

Go to the "Play" option to find opponents and start a match.

## Acknowledgements

This is a work in progress by LAML, MAPV and GMVS. We are a group of grad students from the Universidad Nacional de Colombia.
