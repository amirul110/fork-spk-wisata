const express = require('express');
const router = express.Router();
const wisataController = require('../controllers/wisataController');
const { requireAuth } = require('../middleware/auth');

// USER / WISATAWAN - All routes require authentication
router.get('/', requireAuth, wisataController.getAllWisata);
router.get('/:id', requireAuth, wisataController.getDetailWisata);

module.exports = router;
