const defaultWeights = [
  { id_kriteria: 1, bobot_prioritas: 0.579101 },
  { id_kriteria: 2, bobot_prioritas: 0.232600 },
  { id_kriteria: 3, bobot_prioritas: 0.121271 },
  { id_kriteria: 4, bobot_prioritas: 0.067028 },
];

exports.up = async function(knex) {
  const hasKriteria = await knex.schema.hasTable('kriteria');
  if (!hasKriteria) return;

  await knex.raw('ALTER TABLE kriteria MODIFY COLUMN bobot_prioritas DECIMAL(10,6) NOT NULL');

  for (const item of defaultWeights) {
    await knex('kriteria')
      .where('id_kriteria', item.id_kriteria)
      .update({
        bobot_prioritas: item.bobot_prioritas,
        updated_at: new Date()
      });
  }
};

exports.down = async function(knex) {
  const hasKriteria = await knex.schema.hasTable('kriteria');
  if (!hasKriteria) return;

  await knex.raw('ALTER TABLE kriteria MODIFY COLUMN bobot_prioritas FLOAT NOT NULL');
};
