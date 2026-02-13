// src/routes/adminRoute.js
const express = require('express');
const router = express.Router();

const kriteriaController = require('../controllers/kriteriaController');
// Import Middleware (Satpam)
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Middleware Global untuk file ini:
// Semua route di bawah ini WAJIB Login (Auth) DAN Wajib Admin
router.use(requireAuth, requireAdmin); 

// --- MANAJEMEN KRITERIA ---
// POST /api/v1/admin/kriteria
router.post('/kriteria', kriteriaController.createKriteria);

// PUT /api/v1/admin/kriteria/:id
router.put('/kriteria/:id', kriteriaController.updateKriteria);

// DELETE /api/v1/admin/kriteria/:id
router.delete('/kriteria/:id', kriteriaController.deleteKriteria);

// --- MANAJEMEN SUB-KRITERIA ---
// POST /api/v1/admin/subkriteria
router.post('/subkriteria', kriteriaController.createSubKriteria);

// PUT /api/v1/admin/subkriteria/:id (id_sub)
router.put('/subkriteria/:id', kriteriaController.updateSubKriteria);

// DELETE /api/v1/admin/subkriteria/:id (id_sub)
router.delete('/subkriteria/:id', kriteriaController.deleteSubKriteria);

module.exports = router;