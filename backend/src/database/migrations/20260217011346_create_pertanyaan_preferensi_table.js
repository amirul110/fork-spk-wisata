/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('kriteria', (table) => {
    table.text('deskripsi').nullable().after('jenis');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('kriteria', (table) => {
    table.dropColumn('deskripsi');
  });
};
