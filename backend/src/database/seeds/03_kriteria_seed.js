/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('kriteria').del();

  await knex('kriteria').insert([
    { id_kriteria: 1, nama_kriteria: 'Rating', bobot_prioritas: 0.579101, jenis: 'benefit' },
    { id_kriteria: 2, nama_kriteria: 'Atraksi Wisata', bobot_prioritas: 0.232600, jenis: 'benefit' },
    { id_kriteria: 3, nama_kriteria: 'Harga Tiket', bobot_prioritas: 0.121271, jenis: 'cost' },
    { id_kriteria: 4, nama_kriteria: 'Jarak', bobot_prioritas: 0.067028, jenis: 'cost' },
  ]);
};
