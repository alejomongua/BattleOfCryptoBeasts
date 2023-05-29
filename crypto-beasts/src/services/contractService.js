import Web3 from "web3";
import axios from 'axios';

const web3 = new Web3(window.ethereum);

const abiCoin = require('./abi/CryptoBeastsCoin.json');
const abiNFT = require('./abi/CryptoBeastsNFT.json');
const abiMarketplace = require('./abi/CryptoBeastsMarketplace.json');

const cryptoBeastsCOINAddress = process.env.REACT_APP_CB_COIN_ADDRESS;
const cryptoBeastsNFTAddress = process.env.REACT_APP_CB_NFT_ADDRESS;
const cryptoBeastsMarketplaceAddress = process.env.REACT_APP_CB_MARKETPLACE_ADDRESS;

const coinContract = new web3.eth.Contract(abiCoin.abi, cryptoBeastsCOINAddress);
const nftContract = new web3.eth.Contract(abiNFT.abi, cryptoBeastsNFTAddress);
const marketplaceContract = new web3.eth.Contract(abiMarketplace.abi, cryptoBeastsMarketplaceAddress);
const baseUrl = process.env.REACT_APP_CRYPTO_BEAST_BACK_END + process.env.REACT_APP_CRYPTO_BEAST_BACK_END_PREFIX;

const ContractService = {

    getCards: async (address) => {
        try {
            const response = await axios.get(`${baseUrl}contract/cards?userAddres=${address}`);
            return response.data;
        } catch (ex) {
            return [];
        }
    },

    buyBoosterPack: async (address, cardType) => {
        try {
            await nftContract.methods.buyBoosterPack(cardType).send({from: address});
            return "ok";
        } catch (ex) {
            return "err";
        }
    },

    approve: async (address) => {
        try {
            const amm = "1000000000000000000000000";
            await coinContract.methods.approve(cryptoBeastsNFTAddress, amm).send({from: address});
            return "ok";
        } catch (ex) {
            return "err";
        }
    },

    checkAllowance: async (address) => {
        try {
            return await coinContract.methods.allowance(address, cryptoBeastsNFTAddress).call();
        } catch (ex) {
            console.log(ex)
            return "err";
        }
    },

    checkApprovalCBC: async (address) => {
        try {
            return await coinContract.methods.allowance(address, cryptoBeastsMarketplaceAddress).call();
        } catch (ex) {
            console.log(ex)
            return "err";
        }
    },

    approveMarketplace: async (address) => {
        try {
            const amm = "1000000000000000000000000";
            await coinContract.methods.approve(cryptoBeastsMarketplaceAddress, amm).send({from: address});
            return "ok";
        } catch (ex) {
            return "err";
        }
    },

    checkApproval: async (address) => {
        try {
            return await nftContract.methods.isApprovedForAll(address, cryptoBeastsMarketplaceAddress).call();
        } catch (ex) {
            console.log(ex)
            return "err";
        }
    },

    setApproval: async (address) => {
        try {
            return await nftContract.methods.setApprovalForAll(cryptoBeastsMarketplaceAddress, true).send({from: address});
        } catch (ex) {
            console.log(ex)
            return "err";
        }
    },

    createOffer: async (address, tokenId, price) => {
        try {
            let _tokenId = tokenId
            // Check if tokenId is a string that has _
            if (typeof tokenId === 'string' || tokenId instanceof String) {
                _tokenId = tokenId.split('_')[0]
            }
            const weiAmount = web3.utils.toWei(price, 'ether');
            return await marketplaceContract.methods.createTokenOffer(_tokenId, weiAmount).send({from: address});
        } catch (ex) {
            console.log(ex)
            return "err";
        }
    },

    // This function fetches the current list of offered tokens.
    fetchOffers: async (address) => { // Fetch the current block number.
        try {
            const response = await axios.get(`${baseUrl}contract/offers`);
            return response.data;
        } catch (ex) {
            return [];
        }
    },

    buyToken: async (address, tokenId) => {
        try {
            return await marketplaceContract.methods.buyToken(tokenId).send({from: address});
        } catch (ex) {
            console.log(ex)
            return "err";
        }
    }
}

export default ContractService;
