exports.up = async function(knex) {
  // 1. Matikan pengecekan relasi sementara
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0;');
  
  // 2. Ubah kolom menjadi AUTO_INCREMENT
  await knex.raw('ALTER TABLE kriteria MODIFY COLUMN id_kriteria INT UNSIGNED NOT NULL AUTO_INCREMENT;');
  
  // 3. Hidupkan kembali pengecekan relasi
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1;');
};

exports.down = async function(knex) {
  // Untuk fungsi down, kebalikannya (menghilangkan auto_increment)
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0;');
  await knex.raw('ALTER TABLE kriteria MODIFY COLUMN id_kriteria INT UNSIGNED NOT NULL;');
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1;');
};