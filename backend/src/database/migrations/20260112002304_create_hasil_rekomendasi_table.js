/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('hasil_rekomendasi', table => {
    // 1. Primary Key (Tambahkan unsigned)
// Ubah menjadi increments agar otomatis 1, 2, 3...
  table.increments('id_hasil').primary();
    // 2. Foreign Key ke Preferensi (WAJIB unsigned karena tabel induknya sudah unsigned)
    table
      .integer('id_preferensi', 11)
      .unsigned()
      .references('id_preferensi')
      .inTable('preferensi_wisatawan')
      .onDelete('CASCADE')

    // 3. Foreign Key ke Alternatif (Tambahkan unsigned juga biar aman)
    table
      .integer('id_alternatif', 11)
      .unsigned()
      .references('id_alternatif')
      .inTable('alternatif_wisata')
      .onDelete('CASCADE')

    table.double('jarak_km_hasil').notNullable()
    table.double('skor_akhir_ahp_smart').notNullable()
    table.integer('ranking').notNullable()

    table.timestamps(true, true)
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('hasil_rekomendasi')
}
