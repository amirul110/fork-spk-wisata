const express = require('express');
const router = express.Router();

const wisataController = require('../controllers/wisataController');
const kriteriaController = require('../controllers/kriteriaController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/wisata',requireAuth, wisataController.getAllWisata);
router.get('/wisata/:id', requireAuth, wisataController.getDetailWisata);
router.get('/kriteria', requireAuth, kriteriaController.getAllKriteria);
router.get('/subkriteria/:id',  requireAuth, kriteriaController.getSubKriteriaByKriteria);

module.exports = router