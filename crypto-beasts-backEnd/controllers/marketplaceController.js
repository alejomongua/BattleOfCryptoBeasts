const admin = require("firebase-admin");
const cryptoBeastsMarketplaceAbi = require("../abis/CryptoBeastsMarketplace.json");
const cryptoBeastsNFTAbi = require("../abis/CryptoBeastsNFT.json");
const Web3 = require("web3");
const dotenv = require("dotenv");
const cardController = require("./cardController");

dotenv.config();

// Dirección del contrato CryptoBeastsNFT
const cryptoBeastsNFTAddress = process.env.BEASTS_NFT_ADDRESS;
const cryptoBeastsMarketplaceAddress = process.env.BEASTS_MARKETPLACE_ADDRESS;
const providerUrl = `https://polygon-mumbai.infura.io/v3/${
    process.env.WEB3_INFURA_PROJECT_ID
}`;
const web3 = new Web3(providerUrl);
const cryptoBeastsMarketplace = new web3.eth.Contract(cryptoBeastsMarketplaceAbi.abi, cryptoBeastsMarketplaceAddress);
const cryptoBeastsNft = new web3.eth.Contract(cryptoBeastsNFTAbi.abi, cryptoBeastsNFTAddress);

exports.getCard = async (id) => {
    const card = await cryptoBeastsNft.methods.cards(id).call();
    const nft = await cryptoBeastsNft.methods.tokenURI(id).call();
    const offer = await cryptoBeastsMarketplace.methods.getTokenOffer(id).call();
    let cardDef = {};
    await admin.firestore().collection("cards").where("id", "==", card.cardId).get().then(result => {
        result.forEach((doc) => {
            cardDef = doc.data();
        });
    });

    return {
        tokenId: `${id}_${
            card.cardId
        }_${
            card.rarity
        }`,
        cardId: card.cardId,
        rarity: card.rarity,
        urlImg: nft,
        def: cardDef,
        offer
    };
};

exports.getOffers = async (req, res) => {

    const cards = await cardController.balanceOf(cryptoBeastsNft, cryptoBeastsMarketplaceAddress);

    const cartas = cards.map((card) => {
        return this.getCard(card)
    })
    const responses = await Promise.all(cartas);
    res.send(responses)
}
