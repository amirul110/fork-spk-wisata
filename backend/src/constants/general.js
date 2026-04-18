// src/constants/general.js

// Standar Status Code untuk Respon API
const API_STATUS = {
  SUCCESS: "00",          // Sukses
  FAILED: "01",           // Gagal Umum
  PENDING: "02",          // Menunggu Proses
  NOT_FOUND: "03",        // Data Tidak Ditemukan
  UNAUTHORIZED: "04",     // Token Tidak Valid / Belum Login
  CONFLICT: "05",         // Data Duplikat (Misal email sudah ada)
  FORBIDDEN: "06",        // Dilarang (Bukan hak aksesnya)
  BAD_REQUEST: "99",      // Input User Salah/Kurang
};

// Kunci Standar untuk Objek 'data' di JSON Response
// Supaya frontend tidak bingung, misal: selalu pakai "list_wisata" bukan ganti-ganti
const RESPONSE_DATA_KEYS = {
  // Auth & User
  AUTH: "auth",
  PROFILE: "profile",
  USERS: "users",

  // Master Data SPK
  WISATA: "list_wisata",
  WISATA_DETAIL: "detail_wisata",
  KRITERIA: "list_kriteria",
  SUB_KRITERIA: "list_sub_kriteria",

  // Hasil Perhitungan
  REKOMENDASI: "hasil_rekomendasi",
  NILAI_NORMALISASI: "nilai_normalisasi",
  NILAI_PREFERENSI: "nilai_preferensi"
};

// Role User
const ROLES = {
  ADMIN: "admin",
  WISATAWAN: "wisatawan",
};

// Konstanta Tipe Kriteria SPK (dipakai pada AHP + SMART)
const SPK_TYPES = {
  COST: "cost",       // Biaya (Semakin kecil semakin bagus)
  BENEFIT: "benefit", // Keuntungan (Semakin besar semakin bagus)
};

// Konfigurasi Umum Lainnya
const TIMEZONE = "Asia/Jakarta";


module.exports = {
  API_STATUS,
  RESPONSE_DATA_KEYS,
  ROLES,
  SPK_TYPES,
  TIMEZONE,

};
