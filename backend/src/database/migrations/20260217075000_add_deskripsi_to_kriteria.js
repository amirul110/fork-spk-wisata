exports.up = function(knex) {
  return knex.schema.table('kriteria', (table) => {
    table.text('deskripsi').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('kriteria', (table) => {
    table.dropColumn('deskripsi');
  });
};
