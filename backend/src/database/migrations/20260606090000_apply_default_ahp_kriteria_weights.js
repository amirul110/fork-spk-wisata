const defaultKriteria = [
  { id_kriteria: 1, nama_kriteria: 'Rating', bobot_prioritas: 0.579101, jenis: 'benefit' },
  { id_kriteria: 2, nama_kriteria: 'Atraksi Wisata', bobot_prioritas: 0.232600, jenis: 'benefit' },
  { id_kriteria: 3, nama_kriteria: 'Harga Tiket', bobot_prioritas: 0.121271, jenis: 'cost' },
  { id_kriteria: 4, nama_kriteria: 'Jarak', bobot_prioritas: 0.067028, jenis: 'cost' },
];

const defaultSubKriteria = [
  { id_sub: 1, id_kriteria: 1, code_kriteria: 'C1', nama_sub_kriteria: 'Sangat Baik (4.5 - 5.0)', nilai_bobot: 5, batas_bawah: '4.5', batas_atas: '5.0' },
  { id_sub: 2, id_kriteria: 1, code_kriteria: 'C1', nama_sub_kriteria: 'Baik (4.0 - 4.4)', nilai_bobot: 4, batas_bawah: '4.0', batas_atas: '4.4' },
  { id_sub: 3, id_kriteria: 1, code_kriteria: 'C1', nama_sub_kriteria: 'Cukup (3.5 - 3.9)', nilai_bobot: 3, batas_bawah: '3.5', batas_atas: '3.9' },
  { id_sub: 4, id_kriteria: 1, code_kriteria: 'C1', nama_sub_kriteria: 'Buruk (3.0 - 3.4)', nilai_bobot: 2, batas_bawah: '3.0', batas_atas: '3.4' },
  { id_sub: 5, id_kriteria: 1, code_kriteria: 'C1', nama_sub_kriteria: 'Sangat Buruk (< 3.0)', nilai_bobot: 1, batas_bawah: '0', batas_atas: '2.9' },
  { id_sub: 6, id_kriteria: 2, code_kriteria: 'C2', nama_sub_kriteria: 'Sangat Lengkap (> 5 item)', nilai_bobot: 5, batas_bawah: '6', batas_atas: '100' },
  { id_sub: 7, id_kriteria: 2, code_kriteria: 'C2', nama_sub_kriteria: 'Lengkap (4-5 item)', nilai_bobot: 4, batas_bawah: '4', batas_atas: '5' },
  { id_sub: 8, id_kriteria: 2, code_kriteria: 'C2', nama_sub_kriteria: 'Cukup (3 item)', nilai_bobot: 3, batas_bawah: '3', batas_atas: '3' },
  { id_sub: 9, id_kriteria: 2, code_kriteria: 'C2', nama_sub_kriteria: 'Kurang (2 item)', nilai_bobot: 2, batas_bawah: '2', batas_atas: '2' },
  { id_sub: 10, id_kriteria: 2, code_kriteria: 'C2', nama_sub_kriteria: 'Sangat Kurang (< 2 item)', nilai_bobot: 1, batas_bawah: '0', batas_atas: '1' },
  { id_sub: 11, id_kriteria: 3, code_kriteria: 'C3', nama_sub_kriteria: 'Sangat Murah (< 20rb)', nilai_bobot: 1, batas_bawah: '0', batas_atas: '20000' },
  { id_sub: 12, id_kriteria: 3, code_kriteria: 'C3', nama_sub_kriteria: 'Murah (20rb - 50rb)', nilai_bobot: 2, batas_bawah: '20001', batas_atas: '50000' },
  { id_sub: 13, id_kriteria: 3, code_kriteria: 'C3', nama_sub_kriteria: 'Sedang (50rb - 100rb)', nilai_bobot: 3, batas_bawah: '50001', batas_atas: '100000' },
  { id_sub: 14, id_kriteria: 3, code_kriteria: 'C3', nama_sub_kriteria: 'Mahal (100rb - 200rb)', nilai_bobot: 4, batas_bawah: '100001', batas_atas: '200000' },
  { id_sub: 15, id_kriteria: 3, code_kriteria: 'C3', nama_sub_kriteria: 'Sangat Mahal (> 200rb)', nilai_bobot: 5, batas_bawah: '200001', batas_atas: '10000000' },
  { id_sub: 16, id_kriteria: 4, code_kriteria: 'C4', nama_sub_kriteria: 'Sangat Dekat (< 5 km)', nilai_bobot: 1, batas_bawah: '0', batas_atas: '5' },
  { id_sub: 17, id_kriteria: 4, code_kriteria: 'C4', nama_sub_kriteria: 'Dekat (5 - 15 km)', nilai_bobot: 2, batas_bawah: '5.1', batas_atas: '15' },
  { id_sub: 18, id_kriteria: 4, code_kriteria: 'C4', nama_sub_kriteria: 'Sedang (15 - 30 km)', nilai_bobot: 3, batas_bawah: '15.1', batas_atas: '30' },
  { id_sub: 19, id_kriteria: 4, code_kriteria: 'C4', nama_sub_kriteria: 'Jauh (30 - 50 km)', nilai_bobot: 4, batas_bawah: '30.1', batas_atas: '50' },
  { id_sub: 20, id_kriteria: 4, code_kriteria: 'C4', nama_sub_kriteria: 'Sangat Jauh (> 50 km)', nilai_bobot: 5, batas_bawah: '50.1', batas_atas: '10000' },
];

exports.up = async function(knex) {
  const hasKriteria = await knex.schema.hasTable('kriteria');
  if (!hasKriteria) return;

  for (const item of defaultKriteria) {
    const existing = await knex('kriteria')
      .where('id_kriteria', item.id_kriteria)
      .first();

    if (existing) {
      await knex('kriteria')
        .where('id_kriteria', item.id_kriteria)
        .update({
          nama_kriteria: item.nama_kriteria,
          bobot_prioritas: item.bobot_prioritas,
          jenis: item.jenis,
          updated_at: new Date()
        });
    } else {
      await knex('kriteria').insert({
        ...item,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  }

  const hasSubKriteria = await knex.schema.hasTable('sub_kriteria');
  if (!hasSubKriteria) return;

  for (const item of defaultSubKriteria) {
    const existing = await knex('sub_kriteria')
      .where('id_sub', item.id_sub)
      .first();

    if (existing) {
      await knex('sub_kriteria')
        .where('id_sub', item.id_sub)
        .update({
          id_kriteria: item.id_kriteria,
          code_kriteria: item.code_kriteria,
          nama_sub_kriteria: item.nama_sub_kriteria,
          nilai_bobot: item.nilai_bobot,
          batas_bawah: item.batas_bawah,
          batas_atas: item.batas_atas,
          updated_at: new Date()
        });
    } else {
      await knex('sub_kriteria').insert({
        ...item,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  }
};

exports.down = async function(knex) {
  const hasKriteria = await knex.schema.hasTable('kriteria');
  if (!hasKriteria) return;

  await knex('kriteria')
    .whereIn('id_kriteria', defaultKriteria.map((item) => item.id_kriteria))
    .update({ bobot_prioritas: 0, updated_at: new Date() });
};
