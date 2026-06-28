/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('preferensi_wisatawan').insert([
    {
      id_preferensi: 1,
      id_wisatawan: 1, // User Budi
      waktu_akses: knex.fn.now(),
      user_latitude: -8.650000,
      user_longitude: 115.210000,
      
      // User memilih kriteria:
      id_sub_harga: 12,            // Murah (ID 12)
      id_sub_rating: 2,            // Baik (ID 2)
      
    }
  ]);
};
