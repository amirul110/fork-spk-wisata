exports.up = function(knex) {
  return knex.schema.createTable('token_blacklist', (table) => {
    table.increments('id');
    table.string('token', 500).notNullable().index(); // Token panjang, kita index biar cepat
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('token_blacklist');
};