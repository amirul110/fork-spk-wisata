// src/app.routes.js
const express = require('express');
const router = express.Router();

// 1. IMPORT ROUTES
// Pastikan file ini (authRoute.js) juga sudah ada di folder src/routes/
const authRoutes = require('./routes/authRoute');
// 2. DAFTARKAN ROUTES
router.use('/auth', authRoutes);

// 3. EXPORT
module.exports = router;