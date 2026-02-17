exports.up = function(knex) {
  return knex.raw(`
    ALTER TABLE kriteria 
    MODIFY COLUMN id_kriteria INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
  `);
};

exports.down = function(knex) {
  return knex.raw(`
    ALTER TABLE kriteria 
    MODIFY COLUMN id_kriteria INT UNSIGNED NOT NULL
  `);
};
