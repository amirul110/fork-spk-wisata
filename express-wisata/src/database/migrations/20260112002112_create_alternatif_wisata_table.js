exports.up = function(knex) {
  return knex.schema.createTable('alternatif_wisata', (table) => {
    // Spesifikasi Tabel 3.7
table.increments('id_alternatif').unsigned().primary().notNullable();    table.string('nama_wisata', 100).notNullable();
    table.double('latitude').notNullable();
    table.double('longitude').notNullable();
    table.double('rating_gmaps').notNullable();
    table.double('harga_tiket').notNullable();
    table.text('fasilitas').notNullable();
    table.string('waktu_kunjungan', 100).notNullable();
    
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('alternatif_wisata');
};