const { recoverPersonalSignature } = require("eth-sig-util");
const Web3 = require("web3");

class AuthHelper {
  
  static makeId(length) {
    let result = "";
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  static isValidEthAddress(address) { 
    return Web3.utils.isAddress(address)
  }

  static isValidSignature(address, signature, messageToSign) {
    if (!address || typeof address !== "string" || !signature || !messageToSign) {
      return false;
    }

    const signingAddress = recoverPersonalSignature({
      data: messageToSign,
      sig: signature,
    });

    if (!signingAddress || typeof signingAddress !== "string") {
      return false;
    }

    return signingAddress.toLowerCase() === address.toLowerCase();
  }
}

module.exports = AuthHelper;