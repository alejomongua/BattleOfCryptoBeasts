import Web3 from "web3";
import axios from 'axios';

const abiCoin = require('./abi/CryptoBeastsCoin.json');
const abiNFT = require('./abi/CryptoBeastsNFT.json');

const ContractService = {

  getCards: async (address) => {
    try{
      const baseUrl = process.env.REACT_APP_CRYPTO_BEAST_BACK_END;
      const response = await axios.get(`${baseUrl}contract/cards?userAddres=${address}`);
      return response.data;
    }catch(ex){
      return [];
    }
  },

  buyBoosterPack: async (address, cardType) => {
    const cryptoBeastsNFTAddress = process.env.REACT_APP_CB_NFT_ADDRESS;
    const web3 = new Web3(window.ethereum);
    const nftContract = new web3.eth.Contract(abiNFT.abi, cryptoBeastsNFTAddress);
    try{
      await nftContract.methods.buyBoosterPack(cardType).send({from: address});
      return "ok";
    }catch(ex){
      return "err";
    }
  },

  approve: async (address) => {
    const cryptoBeastsNFTAddress = process.env.REACT_APP_CB_NFT_ADDRESS;
    const cryptoBeastsCOINAddress = process.env.REACT_APP_CB_COIN_ADDRESS;
    const web3 = new Web3(window.ethereum);
    const coinContract = new web3.eth.Contract(abiCoin.abi, cryptoBeastsCOINAddress);
    try{
      const amm = "1000000000000000000000000";
      await coinContract.methods.approve(cryptoBeastsNFTAddress, amm).send({from: address});
      return "ok";
    }catch(ex){
      return "err";
    }
  },

  checkAllowance: async (address) => {
    const cryptoBeastsNFTAddress = process.env.REACT_APP_CB_NFT_ADDRESS;
    const cryptoBeastsCOINAddress = process.env.REACT_APP_CB_COIN_ADDRESS;
    const web3 = new Web3(window.ethereum);
    const coinContract = new web3.eth.Contract(abiCoin.abi, cryptoBeastsCOINAddress);
    try{
      return await coinContract.methods.allowance(address, cryptoBeastsNFTAddress).call();
    }catch(ex){
      console.log(ex)
      return "err";
    }
  }

}

export default ContractService;