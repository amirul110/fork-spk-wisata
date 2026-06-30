/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('hasil_rekomendasi', (table) => {
    // 1. Primary Key
    table.increments('id_hasil').primary();

    // 2. FK ke preferensi_wisatawan
    table
      .integer('id_preferensi', 11)
      .unsigned()
      .references('id_preferensi')
      .inTable('preferensi_wisatawan')
      .onDelete('CASCADE');

    // 3. FK ke alternatif_wisata
    table
      .integer('id_alternatif', 11)
      .unsigned()
      .references('id_alternatif')
      .inTable('alternatif_wisata')
      .onDelete('CASCADE');

    table.double('jarak_km_hasil').notNullable();
    table.double('skor_rekomendasi').notNullable(); // ← nama final yang dipakai controller & seeder
    table.integer('ranking').notNullable();

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('hasil_rekomendasi');
};