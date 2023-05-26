const CryptoJS = require("crypto-js");
const secret_key = process.env.REACT_APP_CYPHER_KEY;

const CipherService = {

    encrypt: (msg, secKey) => {
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(msg), secret_key+secKey).toString();
        return encrypted;
    },
      
    decrypt: (cipherMsg, secKey) => {
        const decrypted = CryptoJS.AES.decrypt(cipherMsg, secret_key+secKey);
        return decrypted.toString(CryptoJS.enc.Utf8);
    }
}

export default CipherService;