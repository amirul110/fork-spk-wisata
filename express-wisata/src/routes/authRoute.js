// src/routes/authRoute.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Public (Gak butuh token)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Logout (User harus login dulu)
router.put('/profile', requireAuth, authController.updateProfile);
router.post('/logout', requireAuth, authController.logout);
// Contoh Route yang diproteksi
// Hanya bisa diakses kalau punya token valid

//public


module.exports = router;