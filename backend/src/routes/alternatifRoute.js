// src/routes/v1/alternatifRoutes.js
const express = require('express');
const router = express.Router();
const alternatifController = require('../controllers/alternatifController');

// Middleware Auth (Asumsi Anda sudah punya ini di folder middlewares)
// Jika belum, hapus bagian ini dulu sementara untuk testing
const { requireAuth, requireAdmin } = require('../middleware/auth');

// === ROUTING CRUD ALTERNATIF WISATA ===

// 1. GET ALL (Tabel Admin)
router.get('/', requireAuth, requireAdmin, alternatifController.getAllAlternatif);

// 2. GET BY ID (Detail untuk Edit)
router.get('/:id', requireAuth, requireAdmin, alternatifController.getAlternatifById);

// 3. POST (Tambah Baru)
router.post('/', requireAuth, requireAdmin, alternatifController.createAlternatif);

// 4. PUT (Update/Edit)
router.put('/:id', requireAuth, requireAdmin, alternatifController.updateAlternatif);

// 5. DELETE (Hapus)
router.delete('/:id', requireAuth, requireAdmin, alternatifController.deleteAlternatif);

module.exports = router;