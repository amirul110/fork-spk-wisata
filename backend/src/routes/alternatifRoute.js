const express = require('express');
const router = express.Router();
const alternatifController = require('../controllers/alternatifController');
const upload = require('../middleware/upload');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// CRUD Alternatif Wisata
router.get('/', requireAuth, requireAdmin, alternatifController.getAllAlternatif);
router.get('/:id', requireAuth, requireAdmin, alternatifController.getAlternatifById);

// Gunakan upload.array untuk mendukung banyak gambar sekaligus
router.post('/', requireAuth, requireAdmin, upload.array('gambar_list', 10), alternatifController.createAlternatif);
router.put('/:id', requireAuth, requireAdmin, upload.array('gambar_list', 10), alternatifController.updateAlternatif);
router.delete('/:id', requireAuth, requireAdmin, alternatifController.deleteAlternatif);

// Hapus 1 gambar spesifik milik wisata
router.delete('/:id/gambar/:gambarId', requireAuth, requireAdmin, alternatifController.deleteGambarById);

module.exports = router;