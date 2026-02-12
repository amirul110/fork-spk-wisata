/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // 1. Matikan Pengecekan Foreign Key Sementara (Khusus MySQL)
  // Ini wajib agar kita bisa men-truncate tabel Induk (seperti kriteria/wisatawan) 
  // tanpa error "Cannot delete or update a parent row"
  await knex.raw("SET FOREIGN_KEY_CHECKS = 0");

  // Daftar tabel yang akan dikosongkan
  // Urutan di sini sebenarnya tidak masalah karena FK Check dimatikan,
  // tapi lebih rapi jika diurutkan dari tabel Anak (Child) ke Induk (Parent).
  const tables = [
    "hasil_rekomendasi",     // Paling bawah (Child dari Preferensi & Alternatif)
    "preferensi_wisatawan",  // Child dari Wisatawan & Sub Kriteria
    "sub_kriteria",          // Child dari Kriteria
    "alternatif_wisata",     // Induk
    "kriteria",              // Induk
    "wisatawan",             // Induk
    "admin"                  // Berdiri sendiri
  ];

  for (const table of tables) {
    // Cek apakah tabel ada di database (untuk menghindari error jika tabel belum dibuat)
    const exists = await knex.schema.hasTable(table);
    
    if (exists) {
      // .truncate() fungsinya: Hapus Semua Data + Reset ID Auto Increment ke 1
      await knex(table).truncate();
    }
  }

  // 2. Hidupkan Kembali Pengecekan Foreign Key
  await knex.raw("SET FOREIGN_KEY_CHECKS = 1");
  
  console.log("🧹 Database Cleaned Successfully (All Tables Truncated & IDs Reset)");
};