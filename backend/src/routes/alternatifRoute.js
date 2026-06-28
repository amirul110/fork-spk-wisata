const express = require('express');
const router = express.Router();
const alternatifController = require('../controllers/alternatifController');
const upload = require('../middleware/upload');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Upload hanya untuk Gambar Wisata (galeri, banyak)
const uploadWisata = upload.fields([
  { name: 'gambar_list', maxCount: 1 },
]);

// CRUD Alternatif Wisata
router.get('/', requireAuth, requireAdmin, alternatifController.getAllAlternatif);
router.get('/:id', requireAuth, requireAdmin, alternatifController.getAlternatifById);
router.post('/', requireAuth, requireAdmin, uploadWisata, alternatifController.createAlternatif);
router.put('/:id', requireAuth, requireAdmin, uploadWisata, alternatifController.updateAlternatif);
router.delete('/:id', requireAuth, requireAdmin, alternatifController.deleteAlternatif);

// Hapus 1 gambar galeri spesifik
router.delete('/:id/gambar/:gambarId', requireAuth, requireAdmin, alternatifController.deleteGambarById);

module.exports = router;