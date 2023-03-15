const express = require('express');
const router = express.Router();
const homeController = require('../controller/homeController');
const joiSchemaValidation = require('../middleware/joiSchemaValidation');
const tokenValidation = require('../middleware/tokenValidation');

router.get('/',
    homeController.getAllHomes  
);

module.exports = router;