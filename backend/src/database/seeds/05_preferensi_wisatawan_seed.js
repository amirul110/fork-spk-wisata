/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex('preferensi_wisatawan').insert([
    { id_preferensi: 1, id_wisatawan: 1, waktu_akses: knex.fn.now(), user_latitude: -7.6500, user_longitude: 111.3300, id_sub_harga: 12, id_sub_atraksi_wisata: 7, id_sub_rating: 2 },
    { id_preferensi: 2, id_wisatawan: 2, waktu_akses: knex.fn.now(), user_latitude: -7.6620, user_longitude: 111.3410, id_sub_harga: 11, id_sub_atraksi_wisata: 7, id_sub_rating: 1 },
    { id_preferensi: 3, id_wisatawan: 3, waktu_akses: knex.fn.now(), user_latitude: -7.6480, user_longitude: 111.3185, id_sub_harga: 13, id_sub_atraksi_wisata: 8, id_sub_rating: 2 },
    { id_preferensi: 4, id_wisatawan: 4, waktu_akses: knex.fn.now(), user_latitude: -7.6710, user_longitude: 111.3520, id_sub_harga: 12, id_sub_atraksi_wisata: 7, id_sub_rating: 1 },
    { id_preferensi: 5, id_wisatawan: 5, waktu_akses: knex.fn.now(), user_latitude: -7.6395, user_longitude: 111.3025, id_sub_harga: 11, id_sub_atraksi_wisata: 8, id_sub_rating: 2 },
    { id_preferensi: 6, id_wisatawan: 6, waktu_akses: knex.fn.now(), user_latitude: -7.6585, user_longitude: 111.3290, id_sub_harga: 12, id_sub_atraksi_wisata: 7, id_sub_rating: 1 },
    { id_preferensi: 7, id_wisatawan: 7, waktu_akses: knex.fn.now(), user_latitude: -7.6440, user_longitude: 111.3360, id_sub_harga: 13, id_sub_atraksi_wisata: 8, id_sub_rating: 2 },
  ]);
};