// src/routes/rekomendasiRoute.js
const express = require('express');
const router = express.Router();
const rekomendasiController = require('../controllers/rekomendasiController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// SEMUA Route di sini WAJIB LOGIN (Butuh Token)
router.use(requireAuth);

// 1. Wisatawan: Hitung SPK
// POST /api/v1/rekomendasi/hitung
router.post('/hitung', rekomendasiController.hitungRekomendasi);

// 2. Wisatawan: Lihat Riwayat Sendiri
// GET /api/v1/rekomendasi/riwayat/me
router.get('/riwayat/me', rekomendasiController.getRiwayatSaya);

// 3. Admin: Lihat Semua Riwayat
// GET /api/v1/rekomendasi/riwayat
router.get('/riwayat', requireAdmin, rekomendasiController.getAllRiwayat);

module.exports = router;