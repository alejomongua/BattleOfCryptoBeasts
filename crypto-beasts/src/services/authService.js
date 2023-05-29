import Web3 from "web3";
import axios from 'axios';
import { signInWithCustomToken } from "firebase/auth";

const AuthService = {

    handleLogin: async (address, auth) => {
      try{
        const baseUrl = process.env.REACT_APP_CRYPTO_BEAST_BACK_END + process.env.REACT_APP_CRYPTO_BEAST_BACK_END_PREFIX;
        const response = await axios.get(`${baseUrl}beast/message?address=${address}`);
        const messageToSign = response?.data?.messageToSign;
    
        if (!messageToSign) {
          throw new Error("Mensaje para firma invalido");
        }
    
        const web3 = new Web3(Web3.givenProvider);
        const signature = await web3.eth.personal.sign(messageToSign, address);
    
        const jwtResponse = await axios.get(
          `${baseUrl}beast/jwt?address=${address}&signature=${signature}`
        );
    
        const customToken = jwtResponse?.data?.customToken;
    
        if (!customToken) {
          throw new Error("JWT Invalido");
        }
    
        await signInWithCustomToken(auth, customToken).then((userCredential)=>{
          return address;
        });
        return "";
      }catch(ex){
        //throw new Error(`Err ${ex}`);
        return "";
      }
    }

}

export default AuthService;