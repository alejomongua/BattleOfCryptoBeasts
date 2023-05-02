const cryptoBeastsNFTAbi = require("../abis/CryptoBeastsNFT.json");
const cardDef = require("../cards_urls.json");
const Web3 = require("web3");
const dotenv = require("dotenv");

dotenv.config();

// Dirección del contrato CryptoBeastsNFT
const cryptoBeastsNFTAddress = process.env.BEASTS_NFT_ADDRESS; 

exports.getCards = async (req,res) => {
  const addr = req.query.userAddres;
  
  const balanceOf = async (cryptoBeastsNFT, userAddress) => {
    const balance = await cryptoBeastsNFT.methods.balanceOf(userAddress).call();
    const tokenIds = [];
  
    for (let i = 0; i < balance; i++) {
      const tokenId = await cryptoBeastsNFT.methods.tokenOfOwnerByIndex(userAddress, i).call();
      tokenIds.push(tokenId);
    }
  
    return tokenIds;
  };

  const getCard = async (cryptoBeastsNFT, id) => {
    const card = await cryptoBeastsNFT.methods.cards(id).call();
    return {
      cardId:card.cardId,
      rarity: card.rarity,
      urlImg: cardDef[card.cardId]
    };
  };

  const providerUrl = `https://sepolia.infura.io/v3/${process.env.WEB3_INFURA_PROJECT_ID}`;
  const web3 = new Web3(providerUrl);
  const cryptoBeastsNft = new web3.eth.Contract(cryptoBeastsNFTAbi.abi, cryptoBeastsNFTAddress);
  
  const userTokens = await balanceOf(cryptoBeastsNft, addr);
  
  const cartas = userTokens.map((card)=>{
    return getCard(cryptoBeastsNft,card)
  })
  const responses = await Promise.all(cartas);
  res.send(responses)
}