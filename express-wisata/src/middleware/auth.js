// src/middleware/auth.js
const { verifyToken } = require('../utils/jwt');
const { API_STATUS } = require('../constants/general');
const db = require('../database/connection').db; // <--- Import DB
// 1. Cek Apakah User Login?
const requireAuth =  async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Header biasanya formatnya: "Bearer eyJhbGci..."
  // Kita ambil tokennya saja (kata kedua)
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: API_STATUS.UNAUTHORIZED,
      message: 'Akses ditolak. Token tidak ditemukan.'
    });
  }

  const isBlacklisted = await db('token_blacklist').where('token', token).first();
  if (isBlacklisted) {
    return res.status(401).json({
      status: API_STATUS.UNAUTHORIZED,
      message: 'Sesi Anda telah berakhir. Silakan login kembali.' // <--- INI EFEKNYA
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      status: API_STATUS.UNAUTHORIZED,
      message: 'Token tidak valid atau kedaluwarsa.'
    });
  }

  // Tempel data user ke request biar bisa dibaca controller
  req.user = decoded; 
  next();
};

// 2. Cek Role (Hanya Admin yang boleh lewat)
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: API_STATUS.UNAUTHORIZED,
      message: 'Hanya Admin yang boleh akses ini.'
    });
  }
  next();
};

module.exports = { requireAuth, requireAdmin };