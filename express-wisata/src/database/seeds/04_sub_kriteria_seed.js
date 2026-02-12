/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Hapus data lama dulu agar bersih
  await knex('sub_kriteria').del();

  await knex('sub_kriteria').insert([
    // --- Kriteria 1: Harga (Cost) ---
    // LOGIKA BARU: 1 = Paling Sedikit (Murah), 5 = Paling Banyak (Mahal)
    { id_sub: 1, id_kriteria: 1, code_kriteria: 'C1', nama_sub_kriteria: 'Sangat Murah (< 20rb)', nilai_bobot: 1, batas_bawah: 0, batas_atas: 20000 },
    { id_sub: 2, id_kriteria: 1, code_kriteria: 'C1', nama_sub_kriteria: 'Murah (20rb - 50rb)', nilai_bobot: 2, batas_bawah: 20001, batas_atas: 50000 },
    { id_sub: 3, id_kriteria: 1, code_kriteria: 'C1', nama_sub_kriteria: 'Sedang (50rb - 100rb)', nilai_bobot: 3, batas_bawah: 50001, batas_atas: 100000 },
    { id_sub: 4, id_kriteria: 1, code_kriteria: 'C1', nama_sub_kriteria: 'Mahal (100rb - 200rb)', nilai_bobot: 4, batas_bawah: 100001, batas_atas: 200000 },
    { id_sub: 5, id_kriteria: 1, code_kriteria: 'C1', nama_sub_kriteria: 'Sangat Mahal (> 200rb)', nilai_bobot: 5, batas_bawah: 200001, batas_atas: 10000000 },

    // --- Kriteria 2: Fasilitas (Benefit) ---
    // (Tetap: 5 = Bagus)
    { id_sub: 6, id_kriteria: 2, code_kriteria: 'C2', nama_sub_kriteria: 'Sangat Lengkap (> 5 item)', nilai_bobot: 5, batas_bawah: 6, batas_atas: 100 },
    { id_sub: 7, id_kriteria: 2, code_kriteria: 'C2', nama_sub_kriteria: 'Lengkap (4-5 item)', nilai_bobot: 4, batas_bawah: 4, batas_atas: 5 },
    { id_sub: 8, id_kriteria: 2, code_kriteria: 'C2', nama_sub_kriteria: 'Cukup (3 item)', nilai_bobot: 3, batas_bawah: 3, batas_atas: 3 },
    { id_sub: 9, id_kriteria: 2, code_kriteria: 'C2', nama_sub_kriteria: 'Kurang (2 item)', nilai_bobot: 2, batas_bawah: 2, batas_atas: 2 },
    { id_sub: 10, id_kriteria: 2, code_kriteria: 'C2', nama_sub_kriteria: 'Sangat Kurang (< 2 item)', nilai_bobot: 1, batas_bawah: 0, batas_atas: 1 },

    // --- Kriteria 3: Jarak (Cost) ---
    // LOGIKA BARU: 1 = Paling Dekat, 5 = Paling Jauh
    { id_sub: 11, id_kriteria: 3, code_kriteria: 'C3', nama_sub_kriteria: 'Sangat Dekat (< 5 km)', nilai_bobot: 1, batas_bawah: 0, batas_atas: 5 },
    { id_sub: 12, id_kriteria: 3, code_kriteria: 'C3', nama_sub_kriteria: 'Dekat (5 - 15 km)', nilai_bobot: 2, batas_bawah: 5.1, batas_atas: 15 },
    { id_sub: 13, id_kriteria: 3, code_kriteria: 'C3', nama_sub_kriteria: 'Sedang (15 - 30 km)', nilai_bobot: 3, batas_bawah: 15.1, batas_atas: 30 },
    { id_sub: 14, id_kriteria: 3, code_kriteria: 'C3', nama_sub_kriteria: 'Jauh (30 - 50 km)', nilai_bobot: 4, batas_bawah: 30.1, batas_atas: 50 },
    { id_sub: 15, id_kriteria: 3, code_kriteria: 'C3', nama_sub_kriteria: 'Sangat Jauh (> 50 km)', nilai_bobot: 5, batas_bawah: 50.1, batas_atas: 10000 },

    // --- Kriteria 4: Rating (Benefit) ---
    // (Tetap: 5 = Bagus)
    { id_sub: 16, id_kriteria: 4, code_kriteria: 'C4', nama_sub_kriteria: 'Sangat Baik (4.5 - 5.0)', nilai_bobot: 5, batas_bawah: 4.5, batas_atas: 5.0 },
    { id_sub: 17, id_kriteria: 4, code_kriteria: 'C4', nama_sub_kriteria: 'Baik (4.0 - 4.4)', nilai_bobot: 4, batas_bawah: 4.0, batas_atas: 4.4 },
    { id_sub: 18, id_kriteria: 4, code_kriteria: 'C4', nama_sub_kriteria: 'Cukup (3.5 - 3.9)', nilai_bobot: 3, batas_bawah: 3.5, batas_atas: 3.9 },
    { id_sub: 19, id_kriteria: 4, code_kriteria: 'C4', nama_sub_kriteria: 'Buruk (3.0 - 3.4)', nilai_bobot: 2, batas_bawah: 3.0, batas_atas: 3.4 },
    { id_sub: 20, id_kriteria: 4, code_kriteria: 'C4', nama_sub_kriteria: 'Sangat Buruk (< 3.0)', nilai_bobot: 1, batas_bawah: 0, batas_atas: 2.9 },

    // --- Kriteria 5: Waktu (Benefit) ---
    // (Tetap)
    { id_sub: 21, id_kriteria: 5, code_kriteria: 'C5', nama_sub_kriteria: 'Pagi (08:00 - 12:00)', nilai_bobot: 5, batas_bawah: 8, batas_atas: 12 },
    { id_sub: 22, id_kriteria: 5, code_kriteria: 'C5', nama_sub_kriteria: 'Siang (12:00 - 15:00)', nilai_bobot: 4, batas_bawah: 12.1, batas_atas: 15 },
    { id_sub: 23, id_kriteria: 5, code_kriteria: 'C5', nama_sub_kriteria: 'Sore (15:00 - 18:00)', nilai_bobot: 3, batas_bawah: 15.1, batas_atas: 18 },
    { id_sub: 24, id_kriteria: 5, code_kriteria: 'C5', nama_sub_kriteria: 'Malam (18:00 - 22:00)', nilai_bobot: 2, batas_bawah: 18.1, batas_atas: 22 },
    { id_sub: 25, id_kriteria: 5, code_kriteria: 'C5', nama_sub_kriteria: 'Bebas / 24 Jam', nilai_bobot: 1, batas_bawah: 0, batas_atas: 24 }
  ]);
};