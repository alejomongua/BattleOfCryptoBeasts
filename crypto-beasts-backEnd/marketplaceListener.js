const admin = require("firebase-admin");
const Web3 = require("web3");

const providerUrl = `https://polygon-mumbai.infura.io/v3/${
    process.env.WEB3_INFURA_PROJECT_ID
}`;
const web3 = new Web3(providerUrl);

const abiMarketplace = require('./abis/CryptoBeastsMarketplace.json');
const cryptoBeastsMarketplaceAddress = process.env.BEASTS_MARKETPLACE_ADDRESS;

const marketplaceContract = new web3.eth.Contract(abiMarketplace.abi, cryptoBeastsMarketplaceAddress);

const dotenv = require("dotenv");
const collection = admin.firestore().collection('offers');

dotenv.config();

console.log('Listening to events...');
marketplaceContract.events.TokenOfferCreated({fromBlock: 'latest'}).on('data', async (event) => {
    const {tokenId, price, seller} = event.returnValues;
    // Add the offer to Firestore
    await collection.doc(tokenId).set({price, seller});
    console.log(`Offer for token ${tokenId} created`)
});

console.log('Listening to events 2...');
marketplaceContract.events.TokenOfferCancelled({fromBlock: 'latest'}).on('data', async (event) => {
    const {tokenId} = event.returnValues;
    // Remove the offer from Firestore
    await collection.doc(tokenId).delete();
    console.log(`Offer for token ${tokenId} cancelled`)
});

console.log('Listening to events 3...');
marketplaceContract.events.TokenPurchased({fromBlock: 'latest'}).on('data', async (event) => {
    const {tokenId} = event.returnValues;
    // Remove the offer from Firestore
    await collection.doc(tokenId).delete();
    console.log(`Token ${tokenId} purchased`)
});
