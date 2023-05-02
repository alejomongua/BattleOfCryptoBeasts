var express = require('express');
var router = express.Router();
const beastController = require('../controllers/beastController')

/**
 * GET /message
 * 
*/
router.get('/message', beastController.getMessageToSign);


/**
 * GET /jwt
 * 
*/
router.get('/jwt', beastController.jwt);



module.exports = router;