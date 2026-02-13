exports.up = function(knex) {
  return knex.schema.alterTable('alternatif_wisata', (table) => {
    table.text('deskripsi').nullable();
    table.string('gambar', 255).nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('alternatif_wisata', (table) => {
    table.dropColumn('deskripsi');
    table.dropColumn('gambar');
  });
};
