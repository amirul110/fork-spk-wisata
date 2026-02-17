const express = require('express');
const router = express.Router();
const wisataController = require('../controllers/wisataController');

// USER / WISATAWAN
router.get('/', wisataController.getAllWisata);
router.get('/:id', wisataController.getDetailWisata);

module.exports = router;
