const admin = require("firebase-admin");
const cryptoBeastsNFTAbi = require("../abis/CryptoBeastsNFT.json");
const Web3 = require("web3");
const dotenv = require("dotenv");

dotenv.config();

// Dirección del contrato CryptoBeastsNFT
const cryptoBeastsNFTAddress = process.env.BEASTS_NFT_ADDRESS;

exports.balanceOf = async (cryptoBeastsNFT, userAddress) => {
    const balance = await cryptoBeastsNFT.methods.balanceOf(userAddress).call();
    const tokenIds = [];

    for (let i = 0; i < balance; i++) {
        const tokenId = await cryptoBeastsNFT.methods.tokenOfOwnerByIndex(userAddress, i).call();
        tokenIds.push(tokenId);
    }

    return tokenIds;
};

exports.getCard = async (cryptoBeastsNFT, id) => {
    const card = await cryptoBeastsNFT.methods.cards(id).call();
    const nft = await cryptoBeastsNFT.methods.tokenURI(id).call();
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
        def: cardDef
    };
};

exports.getCards = async (req, res) => {

    const addr = req.query.userAddres;
    const providerUrl = `https://polygon-mumbai.infura.io/v3/${
        process.env.WEB3_INFURA_PROJECT_ID
    }`;
    const web3 = new Web3(providerUrl);
    const cryptoBeastsNft = new web3.eth.Contract(cryptoBeastsNFTAbi.abi, cryptoBeastsNFTAddress);


    const userTokens = await this.balanceOf(cryptoBeastsNft, addr);

    const cartas = userTokens.map((card) => {
        return this.getCard(cryptoBeastsNft, card)
    })
    const responses = await Promise.all(cartas);
    res.send(responses)
}


exports.getBoosterPack = async (req, res) => {
    const cardType = req.query.cardType;
    const addr = req.query.userAddres;

    const providerUrl = `https://polygon-mumbai.infura.io/v3/${
        process.env.WEB3_INFURA_PROJECT_ID
    }`;
    const web3 = new Web3(providerUrl);
    const cryptoBeastsNft = new web3.eth.Contract(cryptoBeastsNFTAbi.abi, cryptoBeastsNFTAddress, {from: addr});

    try {
        await cryptoBeastsNft.methods.buyBoosterPack(parseInt(cardType)).send();
    } catch (ex) {
        res.status(500).send(ex)
    }
}
