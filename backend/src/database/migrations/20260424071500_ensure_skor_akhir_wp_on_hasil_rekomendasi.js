/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const hasSkorAkhirWp = await knex.schema.hasColumn('hasil_rekomendasi', 'skor_akhir_wp');
  if (!hasSkorAkhirWp) {
    await knex.schema.alterTable('hasil_rekomendasi', (table) => {
      table.double('skor_akhir_wp').nullable();
    });

    const hasSkorRekomendasi = await knex.schema.hasColumn('hasil_rekomendasi', 'skor_rekomendasi');
    const hasSkorAkhir = await knex.schema.hasColumn('hasil_rekomendasi', 'skor_akhir');

    if (hasSkorRekomendasi) {
      await knex('hasil_rekomendasi')
        .whereNull('skor_akhir_wp')
        .update({ skor_akhir_wp: knex.ref('skor_rekomendasi') });
    } else if (hasSkorAkhir) {
      await knex('hasil_rekomendasi')
        .whereNull('skor_akhir_wp')
        .update({ skor_akhir_wp: knex.ref('skor_akhir') });
    }

    await knex.schema.alterTable('hasil_rekomendasi', (table) => {
      table.double('skor_akhir_wp').notNullable().alter();
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function () {
  // Tidak drop kolom untuk menghindari kehilangan data pada rollback.
};
