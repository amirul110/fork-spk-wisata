exports.up = function(knex) {
  return knex.schema.createTable('kriteria', (table) => {
    // Spesifikasi Tabel 3.8
    table.increments('id_kriteria');
    table.string('nama_kriteria', 50).notNullable();
    // Enum: cost atau benefit
    table.enum('jenis', ['cost', 'benefit']).notNullable();
    
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('kriteria');
};