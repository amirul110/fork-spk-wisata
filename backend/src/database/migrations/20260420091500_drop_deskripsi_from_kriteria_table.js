/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const hasDeskripsi = await knex.schema.hasColumn('kriteria', 'deskripsi');
  if (hasDeskripsi) {
    await knex.schema.alterTable('kriteria', (table) => {
      table.dropColumn('deskripsi');
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  const hasDeskripsi = await knex.schema.hasColumn('kriteria', 'deskripsi');
  if (!hasDeskripsi) {
    await knex.schema.alterTable('kriteria', (table) => {
      table.text('deskripsi').nullable();
    });
  }
};
