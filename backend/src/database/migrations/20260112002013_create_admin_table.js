exports.up = function(knex) {
  return knex.schema.createTable('admin', (table) => {
    // Spesifikasi Tabel 3.5
    table.increments('id_admin').primary().notNullable(); // Bisa gunakan .increments() jika auto increment
    table.string('username', 100).notNullable();
    table.string('email', 100).notNullable();
    table.string('password', 255).notNullable();
    
    // Optional: timestamp created_at/updated_at (standar framework)
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('admin');
};