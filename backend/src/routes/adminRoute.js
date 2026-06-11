const express = require('express');
const router = express.Router();
const alternatifController = require('../controllers/alternatifController');
const upload = require('../middleware/upload');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// gambar_list      => Gambar Wisata (galeri)
// gambar_dashboard => Gambar Dashboard (tampil di dashboard wisatawan)
const uploadWisata = upload.fields([
  { name: 'gambar_list', maxCount: 10 },
  { name: 'gambar_dashboard', maxCount: 10 },
]);

router.get('/', requireAuth, requireAdmin, alternatifController.getAllAlternatif);
router.get('/:id', requireAuth, requireAdmin, alternatifController.getAlternatifById);
router.post('/', requireAuth, requireAdmin, uploadWisata, alternatifController.createAlternatif);
router.put('/:id', requireAuth, requireAdmin, uploadWisata, alternatifController.updateAlternatif);
router.delete('/:id', requireAuth, requireAdmin, alternatifController.deleteAlternatif);

router.delete('/:id/gambar/:gambarId', requireAuth, requireAdmin, alternatifController.deleteGambarById);
router.delete('/:id/gambar-dashboard/:gambarId', requireAuth, requireAdmin, alternatifController.deleteGambarDashboardById);

module.exports = router;