/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('hasil_rekomendasi').del();
  
  // Insert data dengan struktur yang benar (tanpa skor_akhir_ahp_smart)
  await knex('hasil_rekomendasi').insert([
    {
      id_alternatif: 2,
      id_preferensi: 1,
      jarak_km_hasil: 12.5,
      ranking: 1,
      skor_rekomendasi: 0.875
    },
    {
      id_alternatif: 1,
      id_preferensi: 1,
      jarak_km_hasil: 5.2,
      ranking: 2,
      skor_rekomendasi: 0.75
    },
    {
      id_alternatif: 3,
      id_preferensi: 1,
      jarak_km_hasil: 25,
      ranking: 3,
      skor_rekomendasi: 0.62
    }
  ]);
};