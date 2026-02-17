/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('preferensi_wisatawan', (table) => {
    
    // 1. PRIMARY KEY --> GANTI JADI INCREMENTS
    // Agar saat user simpan preferensi, ID-nya otomatis dibuatkan (1, 2, 3, dst)
    table.increments('id_preferensi'); 

    // 2. FOREIGN KEY --> TETAP INTEGER
    // Jangan diubah jadi increments! Karena ini menampung ID dari tabel lain.
table.integer('id_wisatawan')
         .unsigned()
         .notNullable() // Tambahkan ini biar data tidak bolong
         .references('id_wisatawan')
         .inTable('wisatawan')
         .onDelete('CASCADE');
    
    table.datetime('waktu_akses').defaultTo(knex.fn.now());
    table.double('user_latitude').notNullable();
    table.double('user_longitude').notNullable();
    
    table.text('data_preferensi');
    // 3. FOREIGN KEYS LAINNYA --> TETAP INTEGER
table.integer('id_sub_harga').unsigned().references('id_sub').inTable('sub_kriteria');
    table.integer('id_sub_fasilitas').unsigned().references('id_sub').inTable('sub_kriteria');
    table.integer('id_sub_waktu_kunjungan').unsigned().references('id_sub').inTable('sub_kriteria');
    table.integer('id_sub_rating').unsigned().references('id_sub').inTable('sub_kriteria');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('preferensi_wisatawan');
};