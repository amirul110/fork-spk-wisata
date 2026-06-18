// src/routes/adminRoute.js
const express = require('express');
const router = express.Router();

const kriteriaController = require('../controllers/kriteriaController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Semua route admin di file ini wajib login + admin
router.use(requireAuth, requireAdmin);

// --- MANAJEMEN KRITERIA ---
router.post('/kriteria', kriteriaController.createKriteria);
router.put('/kriteria/:id', kriteriaController.updateKriteria);
router.delete('/kriteria/:id', kriteriaController.deleteKriteria);

// --- MANAJEMEN SUB-KRITERIA ---
router.post('/subkriteria', kriteriaController.createSubKriteria);
router.put('/subkriteria/:id', kriteriaController.updateSubKriteria);
router.delete('/subkriteria/:id', kriteriaController.deleteSubKriteria);

module.exports = router;