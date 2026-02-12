// src/utils/wpHelper.js

// 1. Rumus Jarak (Haversine) - Tetap butuh ini untuk menghitung jarak real
const hitungJarakKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

// 2. Konversi Data Mentah ke Nilai 1-5 (Utility)
const getNilaiUtility = {
  harga: (val) => {
    if (val === 0) return 5;
    if (val <= 20000) return 5;
    if (val <= 50000) return 4;
    if (val <= 100000) return 3;
    if (val <= 200000) return 2;
    return 1;
  },
  fasilitas: (val) => {
    if (!val) return 1;
    const count = val.split(',').length;
    if (count >= 5) return 5;
    if (count === 4) return 4;
    if (count === 3) return 3;
    if (count === 2) return 2;
    return 1;
  },
  jarak: (km) => {
    // Semakin dekat (nilai 1-5 semakin besar)
    if (km <= 5) return 5;
    if (km <= 15) return 4;
    if (km <= 30) return 3;
    if (km <= 50) return 2;
    return 1;
  },
  rating: (val) => {
    if (val >= 4.6) return 5;
    if (val >= 4.1) return 4;
    if (val >= 3.6) return 3;
    if (val >= 3.0) return 2;
    return 1;
  },
  waktu: (val) => {
    if (val && val.includes('24 Jam')) return 5;
    return 3;
  }
};

module.exports = {
  hitungJarakKm,
  getNilaiUtility
};