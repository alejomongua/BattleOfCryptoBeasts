var express = require('express');
var router = express.Router();
const cardController = require('../controllers/cardController')
const nftController = require('../controllers/nftController')
const marketplaceController = require('../controllers/marketplaceController')

/**
 * GET /cards
 * 
*/
router.get('/cards', cardController.getCards);


/**
 * GET /cards
 * 
*/
router.get('/boosterPack', cardController.getBoosterPack);

router.get('/offers', marketplaceController.getOffers);

module.exports = router;
