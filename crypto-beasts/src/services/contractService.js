import Web3 from "web3";
import axios from 'axios';

const ContractService = {

    getCards: async (address) => {
      try{
        const baseUrl = process.env.REACT_APP_CRYPTO_BEAST_BACK_END;
        const response = await axios.get(`${baseUrl}contract/cards?userAddres=${address}`);
        return response.data;
      }catch(ex){
        return [];
      }
    }

}

export default ContractService;