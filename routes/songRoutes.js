const express = require('express');
const router = express.Router();
const songController = require('../controller/songController');
const joiSchemaValidation = require('../middleware/joiSchemaValidation');
const tokenValidation = require('../middleware/tokenValidation');

router.get(
    "/:id",
    tokenValidation.validateToken,
    songController.getSongById
  );

module.exports = router;