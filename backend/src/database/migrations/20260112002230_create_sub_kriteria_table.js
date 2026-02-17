exports.up = function(knex) {
  return knex.schema.createTable('sub_kriteria', (table) => {
    table.increments('id_sub');
    table.string('code_kriteria', 10).notNullable();
    table.integer('id_kriteria', 11).unsigned().references('id_kriteria').inTable('kriteria').onDelete('CASCADE');
    table.string('nama_sub_kriteria', 100).notNullable();
    table.integer('nilai_bobot', 11).notNullable();
    
    // GANTI 2 BARIS INI:
    // Hapus parameter (8, 2) agar menjadi Double presisi tinggi
    table.double('batas_bawah').nullable();
    table.double('batas_atas').nullable();
    
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('sub_kriteria');
};