/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('kriteria').del();

  await knex('kriteria').insert([
    { id_kriteria: 1, nama_kriteria: 'Rating',  jenis: 'benefit' },
    { id_kriteria: 2, nama_kriteria: 'Atraksi Wisata',  jenis: 'benefit' },
    { id_kriteria: 3, nama_kriteria: 'Harga Tiket',  jenis: 'cost' },
    { id_kriteria: 4, nama_kriteria: 'Jarak',  jenis: 'cost' },
  ]);
};
