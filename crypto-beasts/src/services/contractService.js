import Web3 from "web3";
import axios from 'axios';
import abi from './abi/CryptoBeastsNFT.json';

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
    const cryptoBeastsNFTAddress = "0xd5CD89477D5b3869375c93b0d18548D834a3dafa";
    const web3 = new Web3(window.ethereum);
    const nftContract = new web3.eth.Contract(abi.abi, cryptoBeastsNFTAddress);
    try{
      await nftContract.methods.buyBoosterPack(cardType).send({from: address});
      return "ok";
    }catch(ex){
      return "err";
    }
  }

}

export default ContractService;