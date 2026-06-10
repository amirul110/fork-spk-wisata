/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('wisata_gambar', function (table) {
    table.increments('id').primary();
    table.integer('id_alternatif').unsigned().notNullable();
    table.string('nama_file').notNullable();
    table.integer('urutan').defaultTo(0);
    table.timestamps(true, true);

    table
      .foreign('id_alternatif')
      .references('id_alternatif')
      .inTable('alternatif_wisata')
      .onDelete('CASCADE');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('wisata_gambar');
};