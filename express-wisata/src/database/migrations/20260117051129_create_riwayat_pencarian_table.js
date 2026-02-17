/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('riwayat_pencarian', table => {
    // ID Unik untuk setiap kali klik tombol "Hitung"
    table.increments('id_riwayat').primary(); 

    // Siapa yang mencari? (Foreign Key ke tabel wisatawan)
    table.integer('id_wisatawan').unsigned().notNullable();
    table.foreign('id_wisatawan').references('id_wisatawan').inTable('wisatawan').onDelete('CASCADE');

    // Apa yang dicari? (Menyimpan JSON string preferensi user)
    // Contoh isi: '{"1":5, "2":3}'
    table.text('detail_pencarian').notNullable(); 

    // Kapan mencarinya?
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('riwayat_pencarian');
};