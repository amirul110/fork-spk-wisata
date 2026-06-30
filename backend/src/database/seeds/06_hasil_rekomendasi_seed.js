/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex('hasil_rekomendasi').del();

  await knex('hasil_rekomendasi').insert([
    // Wisatawan 1
    { id_preferensi: 1, id_alternatif: 1,  ranking: 1, skor_rekomendasi: 0.953, jarak_km_hasil: 14.2 },
    { id_preferensi: 1, id_alternatif: 2,  ranking: 2, skor_rekomendasi: 0.925, jarak_km_hasil: 18.6 },
    { id_preferensi: 1, id_alternatif: 3,  ranking: 3, skor_rekomendasi: 0.737, jarak_km_hasil: 9.4 },
    { id_preferensi: 1, id_alternatif: 10, ranking: 4, skor_rekomendasi: 0.726, jarak_km_hasil: 22.1 },
    { id_preferensi: 1, id_alternatif: 6,  ranking: 5, skor_rekomendasi: 0.669, jarak_km_hasil: 5.8 },
    // Wisatawan 2
    { id_preferensi: 2, id_alternatif: 1,  ranking: 1, skor_rekomendasi: 0.940, jarak_km_hasil: 15.0 },
    { id_preferensi: 2, id_alternatif: 2,  ranking: 2, skor_rekomendasi: 0.910, jarak_km_hasil: 19.2 },
    { id_preferensi: 2, id_alternatif: 6,  ranking: 3, skor_rekomendasi: 0.720, jarak_km_hasil: 6.1 },
    { id_preferensi: 2, id_alternatif: 3,  ranking: 4, skor_rekomendasi: 0.700, jarak_km_hasil: 10.3 },
    { id_preferensi: 2, id_alternatif: 9,  ranking: 5, skor_rekomendasi: 0.660, jarak_km_hasil: 16.8 },
    // Wisatawan 3
    { id_preferensi: 3, id_alternatif: 2,  ranking: 1, skor_rekomendasi: 0.930, jarak_km_hasil: 18.0 },
    { id_preferensi: 3, id_alternatif: 1,  ranking: 2, skor_rekomendasi: 0.900, jarak_km_hasil: 13.9 },
    { id_preferensi: 3, id_alternatif: 3,  ranking: 3, skor_rekomendasi: 0.750, jarak_km_hasil: 9.1 },
    { id_preferensi: 3, id_alternatif: 4,  ranking: 4, skor_rekomendasi: 0.680, jarak_km_hasil: 12.7 },
    { id_preferensi: 3, id_alternatif: 5,  ranking: 5, skor_rekomendasi: 0.640, jarak_km_hasil: 20.5 },
    // Wisatawan 4
    { id_preferensi: 4, id_alternatif: 1,  ranking: 1, skor_rekomendasi: 0.960, jarak_km_hasil: 15.4 },
    { id_preferensi: 4, id_alternatif: 3,  ranking: 2, skor_rekomendasi: 0.780, jarak_km_hasil: 8.9 },
    { id_preferensi: 4, id_alternatif: 2,  ranking: 3, skor_rekomendasi: 0.770, jarak_km_hasil: 19.8 },
    { id_preferensi: 4, id_alternatif: 6,  ranking: 4, skor_rekomendasi: 0.700, jarak_km_hasil: 6.4 },
    { id_preferensi: 4, id_alternatif: 10, ranking: 5, skor_rekomendasi: 0.690, jarak_km_hasil: 23.0 },
    // Wisatawan 5
    { id_preferensi: 5, id_alternatif: 2,  ranking: 1, skor_rekomendasi: 0.920, jarak_km_hasil: 17.5 },
    { id_preferensi: 5, id_alternatif: 1,  ranking: 2, skor_rekomendasi: 0.890, jarak_km_hasil: 13.2 },
    { id_preferensi: 5, id_alternatif: 6,  ranking: 3, skor_rekomendasi: 0.730, jarak_km_hasil: 5.5 },
    { id_preferensi: 5, id_alternatif: 9,  ranking: 4, skor_rekomendasi: 0.670, jarak_km_hasil: 16.0 },
    { id_preferensi: 5, id_alternatif: 8,  ranking: 5, skor_rekomendasi: 0.630, jarak_km_hasil: 11.9 },
    // Wisatawan 6
    { id_preferensi: 6, id_alternatif: 1,  ranking: 1, skor_rekomendasi: 0.950, jarak_km_hasil: 14.7 },
    { id_preferensi: 6, id_alternatif: 2,  ranking: 2, skor_rekomendasi: 0.900, jarak_km_hasil: 18.9 },
    { id_preferensi: 6, id_alternatif: 3,  ranking: 3, skor_rekomendasi: 0.740, jarak_km_hasil: 9.6 },
    { id_preferensi: 6, id_alternatif: 10, ranking: 4, skor_rekomendasi: 0.710, jarak_km_hasil: 22.4 },
    { id_preferensi: 6, id_alternatif: 4,  ranking: 5, skor_rekomendasi: 0.660, jarak_km_hasil: 12.3 },
    // Wisatawan 7
    { id_preferensi: 7, id_alternatif: 1,  ranking: 1, skor_rekomendasi: 0.940, jarak_km_hasil: 15.1 },
    { id_preferensi: 7, id_alternatif: 2,  ranking: 2, skor_rekomendasi: 0.920, jarak_km_hasil: 19.0 },
    { id_preferensi: 7, id_alternatif: 6,  ranking: 3, skor_rekomendasi: 0.710, jarak_km_hasil: 6.0 },
    { id_preferensi: 7, id_alternatif: 3,  ranking: 4, skor_rekomendasi: 0.690, jarak_km_hasil: 9.8 },
    { id_preferensi: 7, id_alternatif: 5,  ranking: 5, skor_rekomendasi: 0.650, jarak_km_hasil: 20.1 },
  ]);
};