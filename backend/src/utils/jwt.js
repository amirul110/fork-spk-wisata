// src/utils/jwt.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET || 'rahasia_skripsi_123'; // Simpan di .env

// Fungsi Bikin Token
const generateToken = (userData) => {
  // Token berlaku 24 jam
  return jwt.sign(userData, SECRET_KEY, { expiresIn: '24h' });
};

// Fungsi Cek Token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };