/**
 * Migration to change batas_bawah and batas_atas columns from DOUBLE to VARCHAR
 * This allows preserving exact text format like "09.00", "09.01", "24 jam"
 */

exports.up = function(knex) {
  return knex.schema.alterTable('sub_kriteria', (table) => {
    // Change batas_bawah from double to varchar(50)
    table.string('batas_bawah', 50).nullable().alter();
    // Change batas_atas from double to varchar(50)
    table.string('batas_atas', 50).nullable().alter();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('sub_kriteria', (table) => {
    // Revert back to double
    table.double('batas_bawah').nullable().alter();
    table.double('batas_atas').nullable().alter();
  });
};
