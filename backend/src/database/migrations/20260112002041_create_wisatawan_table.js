exports.up = function(knex) {
  return knex.schema.createTable('wisatawan', (table) => {
    // Spesifikasi Tabel 3.6
    table.increments('id_wisatawan')
    table.string('username', 50).notNullable();
    table.string('email', 100).notNullable();
    table.string('password', 255).notNullable();
    
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('wisatawan');
};