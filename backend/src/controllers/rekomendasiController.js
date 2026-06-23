// src/controllers/rekomendasiController.js
const db = require('../database/connection').db;
const { TABLES } = require('../constants/database');
const { API_STATUS, RESPONSE_DATA_KEYS } = require('../constants/general');
const spkHelper = require('../utils/spkHelper');

// LANGSUNG PAKAI skor_rekomendasi - TIDAK PERLU DETEKSI OTOMATIS
const SCORE_COLUMN = 'skor_rekomendasi';

module.exports = {

  hitungRekomendasi: async (req, res) => {
    // 1. INISIALISASI TRANSACTION
    const trx = await db.transaction();

    try {
      const { id: userId } = req.user;
const { userLocation, matrix } = req.body;


      // --- VALIDASI INPUT ---
      if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
        await trx.rollback();
        return res.status(400).json({
          status: API_STATUS.BAD_REQUEST,
          message: 'Lokasi User (Latitude & Longitude) wajib dikirim!'
        });
      }

      // --- AMBIL DATA DARI DATABASE (PRE-FETCHING) ---
      const wisataRaw = await trx(TABLES.WISATA).select('*');
      const dbKriteria = await trx('kriteria').select('*');
      const dbSubKriteria = await trx('sub_kriteria').select('*');
      const kriteriaIds = dbKriteria
        .map((k) => Number(k.id_kriteria))
        .sort((a, b) => a - b);

      if (kriteriaIds.length === 0) {
        await trx.rollback();
        return res.status(400).json({
          status: API_STATUS.BAD_REQUEST,
          message: 'Data kriteria belum tersedia.'
        });
      }

      // --- VALIDASI MATRIKS PERBANDINGAN (AHP DINAMIS DARI USER) ---
const n = kriteriaIds.length;
const isMatrixValid =
  Array.isArray(matrix) &&
  matrix.length === n &&
  matrix.every((row) => Array.isArray(row) && row.length === n);

if (!isMatrixValid) {
  await trx.rollback();
  return res.status(400).json({
    status: API_STATUS.BAD_REQUEST,
    message: `Matriks perbandingan ${n}x${n} wajib dikirim (preferensi kriteria user).`
  });
}
      // --- MAPPING KOLOM ---
      const colMapper = {
        1: 'rating_gmaps',
        2: 'atraksi_wisata',
        3: 'harga_tiket',
        4: 'jarak_real'
      };

      // --- FUNGSI PENCARI NILAI DARI SUB KRITERIA ---
      const getScoreFromDb = (kriteriaId, rawValue) => {
        const rules = dbSubKriteria.filter(sub => sub.id_kriteria == kriteriaId);
        
        for (const rule of rules) {
            const min = parseFloat(rule.batas_bawah);
            const max = parseFloat(rule.batas_atas);
            const score = parseInt(rule.nilai_bobot);

            if (kriteriaId == 2) { 
                const itemsCount = rawValue ? rawValue.split(',').length : 0;
                if (itemsCount >= min && (max >= 100 || itemsCount <= max)) {
                    return score;
                }
            } else {
                if (rawValue >= min && rawValue <= max) {
                    return score;
                }
            }
        }
        return 1;
      };

    // HAPUS seluruh blok lama mulai "// --- BOBOT ADMIN (HASIL AHP) ---"
// sampai akhir pembuatan weightByKriteriaId, GANTI dengan:

// --- BOBOT DINAMIS DARI USER (AHP PAIRWISE) ---
const ahp = spkHelper.hitungBobotAHP(matrix);

if (!ahp.konsisten) {
  await trx.rollback();
  return res.status(400).json({
    status: API_STATUS.BAD_REQUEST,
    message: `Perbandingan kriteria tidak konsisten (CR = ${ahp.CR.toFixed(4)} >= 0.1). Silakan isi ulang preferensi Anda.`,
    data: { cr: Number(ahp.CR.toFixed(4)) }
  });
}

const weightByKriteriaId = {};
kriteriaIds.forEach((id, index) => {
  weightByKriteriaId[id] = ahp.weights[index];
});

      // --- SIMPAN RIWAYAT USER + SNAPSHOT BOBOT ADMIN ---
const bobotUserSnapshot = {
	metode: "AHP-dinamis (pairwise)",
	matrix,
	cr: Number(ahp.CR.toFixed(4)),
	bobot_user: kriteriaIds.map((id, index) => ({
		id_kriteria: id,
		bobot: Number((ahp.weights[index] || 0).toFixed(6)),
	})),
}
// simpan JSON.stringify(bobotUserSnapshot) ke data_preferensi & detail_pencarian

const [preferensiId] = await trx('preferensi_wisatawan').insert({
  id_wisatawan: userId,
  user_latitude: userLocation.latitude,
  user_longitude: userLocation.longitude,
  data_preferensi: JSON.stringify({
    metode: 'AHP-dinamis',
    matrix,
    bobot_user: bobotUserSnapshot,
    cr: Number(ahp.CR.toFixed(4))
  }),
  created_at: new Date()
});

await trx(TABLES.RIWAYAT_PENCARIAN).insert({
  id_wisatawan: userId,
  detail_pencarian: JSON.stringify({ userLocation, matrix, bobot_user: bobotUserSnapshot, cr: Number(ahp.CR.toFixed(4)) }),
  created_at: new Date()
});

      // --- HITUNG NILAI ALTERNATIF DENGAN SMART ---
      const candidates = wisataRaw.map(w => {
        const jarakKm = spkHelper.hitungJarakKm(
          Number(userLocation.latitude), Number(userLocation.longitude),
          w.latitude, w.longitude
        );

        const rawByKriteria = {};
        kriteriaIds.forEach((kID) => {
          const colName = colMapper[kID];
          const rawValue = colName === 'jarak_real' ? jarakKm : w[colName];
          rawByKriteria[kID] = getScoreFromDb(kID, rawValue);
        });

        return { ...w, jarak_km: jarakKm, rawByKriteria };
      });

      const utilityBoundary = {};
      kriteriaIds.forEach((kID) => {
        const values = candidates.map(c => Number(c.rawByKriteria[kID]));
        utilityBoundary[kID] = {
          min: Math.min(...values),
          max: Math.max(...values)
        };
      });

      const finalResult = candidates.map(item => {
        let skorAkhir = 0;

        kriteriaIds.forEach((kID) => {
          const value = Number(item.rawByKriteria[kID]);
          const { min, max } = utilityBoundary[kID];
          const denom = max - min;
          const kriteriaInfo = dbKriteria.find(k => Number(k.id_kriteria) === Number(kID));

          let utility = 1;
          if (denom !== 0) {
            if (kriteriaInfo && kriteriaInfo.jenis === 'cost') {
              utility = (max - value) / denom;
            } else {
              utility = (value - min) / denom;
            }
          }

          skorAkhir += (weightByKriteriaId[kID] || 0) * utility;
        });

        return {
          ...item,
          skor_rekomendasi: skorAkhir.toFixed(4),
          jarak_dari_anda: item.jarak_km.toFixed(2) + ' KM'
        };
      });

      // Sort Ranking (Besar ke Kecil)
      finalResult.sort((a, b) => Number(b.skor_rekomendasi) - Number(a.skor_rekomendasi));

      // --- SIMPAN TOP 5 KE DATABASE (PAKAI skor_rekomendasi LANGSUNG) ---
      const top5 = finalResult.slice(0, 5); 
      const dataToInsert = top5.map((item, index) => ({
        id_preferensi: preferensiId,
        id_alternatif: item.id_alternatif,
        skor_rekomendasi: Number(item.skor_rekomendasi), // LANGSUNG PAKAI skor_rekomendasi
        ranking: index + 1,
        jarak_km_hasil: parseFloat(item.jarak_km)
      }));

      if(dataToInsert.length > 0) {
          await trx(TABLES.HASIL_REKOMENDASI).insert(dataToInsert);
      }

      // --- FORMAT RESPONSE JSON ---
      const responseData = finalResult.map((item, index) => ({
          peringkat_ke: index + 1,
          id_alternatif: item.id_alternatif,
          nama_wisata: item.nama_wisata,
          rating_gmaps: item.rating_gmaps,
          harga_tiket: item.harga_tiket,
          atraksi_wisata: item.atraksi_wisata,
          jarak_dari_anda: item.jarak_dari_anda,
          skor_rekomendasi: item.skor_rekomendasi
      }));

      await trx.commit();

      return res.json({
        status: API_STATUS.SUCCESS,
        message: 'Perhitungan AHP + SMART selesai',
        data: {
          id_riwayat: preferensiId,
          bobot_ahp: kriteriaIds.map((id) => ({
            id_kriteria: id,
            bobot: Number((weightByKriteriaId[id] || 0).toFixed(6))
          })),
          [RESPONSE_DATA_KEYS.REKOMENDASI]: responseData
        }
      });

    } catch (error) {
      await trx.rollback();
      console.error("Error Hitung AHP+SMART:", error);
      return res.status(500).json({ 
        message: 'Gagal menghitung rekomendasi AHP + SMART',
        error: error.message 
      });
    }
    return res.status(200).json({
	message: "Rekomendasi berhasil dihitung",
	data: {
		id_riwayat: preferensiId,
		cr: Number(ahp.CR.toFixed(4)),
		bobot_ahp: kriteriaIds.map((id, index) => ({
			id_kriteria: id,
			bobot: Number((ahp.weights[index] || 0).toFixed(6)),
		})),
		[RESPONSE_DATA_KEYS.REKOMENDASI]: responseData,
	},
})
  },

  // [GET] RIWAYAT SAYA (Versi Rapi untuk Wisatawan)
  getRiwayatSaya: async (req, res) => {
    try {
      const { id } = req.user;
      
      const data = await db(TABLES.HASIL_REKOMENDASI)
        .join('preferensi_wisatawan', 'hasil_rekomendasi.id_preferensi', '=', 'preferensi_wisatawan.id_preferensi')
        .join('alternatif_wisata', 'hasil_rekomendasi.id_alternatif', '=', 'alternatif_wisata.id_alternatif')
        .where('preferensi_wisatawan.id_wisatawan', id) 
        .where('hasil_rekomendasi.ranking', 1)          
        .select(
            'preferensi_wisatawan.created_at as tanggal',
            'alternatif_wisata.nama_wisata as rekomendasi_utama',
            'alternatif_wisata.rating_gmaps',
            'hasil_rekomendasi.skor_rekomendasi as skor_akhir', // LANGSUNG PAKAI skor_rekomendasi
            'hasil_rekomendasi.jarak_km_hasil'
        )
        .orderBy('preferensi_wisatawan.created_at', 'desc');

      const formattedData = data.map(item => {
        const dateObj = new Date(item.tanggal);
        const options = { 
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
        };
        const tanggalIndo = dateObj.toLocaleString('id-ID', options).replace(/:/g, '.');

        return {
            tanggal: tanggalIndo, 
            rekomendasi_utama: item.rekomendasi_utama,
            skor: parseFloat(item.skor_akhir || 0).toFixed(4),
            jarak: parseFloat(item.jarak_km_hasil).toFixed(1) + " KM",
            info: "Ini adalah rekomendasi terbaik berdasarkan perhitungan AHP + SMART saat itu."
        };
      });

      return res.json({
        status: API_STATUS.SUCCESS,
        message: 'Riwayat Rekomendasi Anda',
        data: formattedData
      });

    } catch (error) {
      console.error("Error Get Riwayat Me:", error);
      return res.status(500).json({ 
        message: 'Gagal mengambil riwayat',
        error: error.message 
      });
    }
  },

  // [GET] SEMUA RIWAYAT (Admin Only)
  getAllRiwayat: async (req, res) => {
    try {
      // Hitung jumlah wisatawan unik yang pernah melakukan perhitungan
      const wisatawanCountResult = await db('preferensi_wisatawan')
        .countDistinct('id_wisatawan as total')
        .first();

      const data = await db(TABLES.HASIL_REKOMENDASI)
        .join(TABLES.WISATA, `${TABLES.HASIL_REKOMENDASI}.id_alternatif`, '=', `${TABLES.WISATA}.id_alternatif`)
        .select(
            `${TABLES.WISATA}.nama_wisata`,
            db.raw(`AVG(${TABLES.HASIL_REKOMENDASI}.skor_rekomendasi) as rata_rata_skor`), // LANGSUNG PAKAI skor_rekomendasi
            db.raw('AVG(hasil_rekomendasi.ranking) as rata_rata_ranking_asli')
        )
        .groupBy(`${TABLES.WISATA}.id_alternatif`, `${TABLES.WISATA}.nama_wisata`)
        .orderBy('rata_rata_skor', 'desc');

      const formattedData = data.map((item, index) => ({
        global_ranking: index + 1,
        nama_wisata: item.nama_wisata,
        skor_rata_rata: parseFloat(item.rata_rata_skor).toFixed(4),
        ranking_rata_rata: parseFloat(item.rata_rata_ranking_asli).toFixed(1)
      }));

      return res.json({
        status: API_STATUS.SUCCESS,
        message: 'Laporan Analitik Performa Wisata (Rata-rata Global)',
        data: formattedData,
        total_wisatawan: parseInt(wisatawanCountResult.total) || 0
      });

    } catch (error) {
      console.error("Error Get Laporan Global:", error);
      return res.status(500).json({ 
        message: 'Gagal mengambil laporan analitik',
        error: error.message 
      });
    }
  }
};

