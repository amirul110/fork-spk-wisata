// src/app.js

// 1. CONFIGURATION
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const corsOptions = require("./config/cors");
const cookieParser = require('cookie-parser'); // Opsional, tapi bagus ada
const app = express();

// IMPORT ROUTER UTAMA
const appRoutes = require('./app.routes'); // <-- Ini file yang baru kita buat
const dashboardRoute = require('./routes/dashboardRoute');
const adminRoutes = require('./routes/adminRoute')
const rekomendasiRoutes = require('./routes/rekomendasiRoute');
const alternatifRoutes = require('./routes/alternatifRoute');


const wisataRoutes = require('./routes/wisataRoute');
// 2. MIDDLEWARE
// Mengizinkan akses dari frontend
app.use(cors(corsOptions)); 

// Logging sederhana (biar tau ada request masuk)
app.use((req, res, next) => {
  console.log(`[LOG] ${req.method} ${req.url}`);
  next();
});

// Parser Body (JSON & URL Encoded)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. HEALTH CHECK (Root URL)
// Cek apakah server nyala tanpa prefix api
app.get('/', (req, res) => {
  res.status(200).json({
    message: "✅ Server Backend SPK Wisata Berjalan Normal!",
    timestamp: new Date().toLocaleString(),
    version: "1.0.0"
  });
});

// 4. LOAD ROUTES (Dengan Prefix /api/v1)
// Semua route di app.routes.js otomatis punya awalan /api/v1
app.use('/api/v1', appRoutes);
app.use('/api/v1', dashboardRoute);
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/admin/wisata', alternatifRoutes);
app.use('/api/v1/rekomendasi', rekomendasiRoutes);


//wisatawan
app.use('/api/v1/wisata', wisataRoutes);
// 5. ERROR HANDLING (404 Not Found)
app.use((req, res, next) => {
  res.status(404).json({
    status: '04',
    message: `Endpoint ${req.originalUrl} tidak ditemukan di server ini.`
  });
});

// 6. START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Server berjalan di: http://localhost:${PORT}`);
  console.log(`📡 API Base URL:       http://localhost:${PORT}/api/v1`);
  console.log(`=================================================`);
});

// (Opsional) Export app jika nanti butuh testing
module.exports = app;