
// --- AUTHENTICATION & USERS ---
const ADMIN_TABLE = "admin";
const WISATAWAN_TABLE = "wisatawan";
const TOKEN_BLACKLIST_TABLE = "token_blacklist";

// --- MASTER DATA SPK (CORE) ---
// Tabel objek wisata (Alternatif)
const WISATA_TABLE = "alternatif_wisata"; 

// Tabel Kriteria (Harga, Jarak, Fasilitas, dll)
const KRITERIA_TABLE = "kriteria";

// Tabel Sub-Kriteria (Pilihan untuk user: Murah, Mahal, Dekat, Jauh)
const SUB_KRITERIA_TABLE = "sub_kriteria";

// --- TRANSACTION / HISTORY (OPSIONAL) ---
// Jika Anda menyimpan riwayat pencarian user
const RIWAYAT_PENCARIAN_TABLE = "riwayat_pencarian";

// Jika Anda menyimpan hasil akhir rekomendasi
const HASIL_REKOMENDASI_TABLE = "hasil_rekomendasi";

module.exports = {
  ADMIN_TABLE,
  WISATAWAN_TABLE,
  TOKEN_BLACKLIST_TABLE,
  WISATA_TABLE,
  KRITERIA_TABLE,
  SUB_KRITERIA_TABLE,
  RIWAYAT_PENCARIAN_TABLE,
  HASIL_REKOMENDASI_TABLE,

  TABLES: {
    ADMIN: ADMIN_TABLE,
    WISATAWAN: WISATAWAN_TABLE,
    BLACKLIST: TOKEN_BLACKLIST_TABLE,
    WISATA: WISATA_TABLE,
    KRITERIA: KRITERIA_TABLE,
    SUB_KRITERIA: SUB_KRITERIA_TABLE,

    RIWAYAT_PENCARIAN: RIWAYAT_PENCARIAN_TABLE,
    HASIL_REKOMENDASI: HASIL_REKOMENDASI_TABLE
  }
};