/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Hasil perhitungan fiktif
  await knex('hasil_rekomendasi').insert([
    {
      id_hasil: 1,
      id_preferensi: 1,
      id_alternatif: 2, // Tanah Lot
      jarak_km_hasil: 12.5,
      skor_akhir_wp: 0.875,
      ranking: 1
    },
    {
      id_hasil: 2,
      id_preferensi: 1,
      id_alternatif: 1, // Pantai Kuta
      jarak_km_hasil: 5.2,
      skor_akhir_wp: 0.750,
      ranking: 2
    },
    {
      id_hasil: 3,
      id_preferensi: 1,
      id_alternatif: 3, // Monkey Forest
      jarak_km_hasil: 25.0,
      skor_akhir_wp: 0.620,
      ranking: 3
    }
  ]);
};