// src/controllers/rekomendasiController.js
const db = require('../database/connection').db;
const { TABLES } = require('../constants/database');
const { API_STATUS, RESPONSE_DATA_KEYS } = require('../constants/general');
const spkHelper = require('../utils/spkHelper');

const MAX_AHP_CRITERIA = 15;
const AHP_CR_THRESHOLD = 0.1;
const AHP_RI_TABLE = {
  1: 0.0, 2: 0.0, 3: 0.58, 4: 0.9, 5: 1.12,
  6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49,
  11: 1.51, 12: 1.48, 13: 1.56, 14: 1.57, 15: 1.59
};

module.exports = {

  hitungRekomendasi: async (req, res) => {
    // 1. INISIALISASI TRANSACTION
    const trx = await db.transaction();

    try {
      const { id: userId } = req.user;
      const { perbandinganAHP, userLocation } = req.body;

      // --- VALIDASI INPUT ---
      if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
        await trx.rollback();
        return res.status(400).json({
          status: API_STATUS.BAD_REQUEST,
          message: 'Lokasi User (Latitude & Longitude) wajib dikirim!'
        });
      }

      if (!perbandinganAHP || typeof perbandinganAHP !== 'object') {
        await trx.rollback();
        return res.status(400).json({ message: 'Data perbandingan AHP wajib diisi' });
      }

      // --- SIMPAN PREFERENSI USER ---
      const [preferensiId] = await trx('preferensi_wisatawan').insert({
        id_wisatawan: userId,
        user_latitude: userLocation.latitude,
        user_longitude: userLocation.longitude,
        data_preferensi: JSON.stringify(perbandinganAHP),
        created_at: new Date()
      });

      // Simpan Log (Backup)
      await trx(TABLES.RIWAYAT_PENCARIAN).insert({
        id_wisatawan: userId,
        detail_pencarian: JSON.stringify({ perbandinganAHP, userLocation }),
        created_at: new Date()
      });

      // --- AMBIL DATA DARI DATABASE (PRE-FETCHING) ---
      // Kita ambil semua data yang dibutuhkan di awal agar cepat (hindari query dalam loop)
      const wisataRaw = await trx(TABLES.WISATA).select('*');
      const dbKriteria = await trx('kriteria').select('*');         // Untuk cek Cost/Benefit
      const dbSubKriteria = await trx('sub_kriteria').select('*');  // Untuk Range Nilai (1-5)

      // --- MAPPING KOLOM ---
      // Memberitahu sistem: ID Kriteria 1 itu kolom apa di tabel wisata?
      const colMapper = {
        1: 'harga_tiket',
        2: 'fasilitas',
        3: 'jarak_real', // Spesial, dihitung manual via Haversine
        4: 'rating_gmaps',
        5: 'waktu_kunjungan'
      };

      // --- FUNGSI PENCARI NILAI DARI SUB KRITERIA (LOGIC DB) ---
      const getScoreFromDb = (kriteriaId, rawValue) => {
        // Ambil aturan range khusus untuk kriteria ini
        const rules = dbSubKriteria.filter(sub => sub.id_kriteria == kriteriaId);
        
        // Loop setiap aturan
        for (const rule of rules) {
            const min = parseFloat(rule.batas_bawah);
            const max = parseFloat(rule.batas_atas);
            const score = parseInt(rule.nilai_bobot);

            // A. Logika Fasilitas (Hitung Jumlah Item string)
            if (kriteriaId == 2) { 
                const itemsCount = rawValue ? rawValue.split(',').length : 0;
                // Cek range
                if (itemsCount >= min && (max >= 100 || itemsCount <= max)) {
                    return score;
                }
            } 
            // B. Logika Waktu (Cek string '24 Jam')
            else if (kriteriaId == 5) {
                // Sederhana: Jika wisata buka 24 jam, beri nilai maksimal (sesuai seeder)
                if (rawValue && rawValue.includes('24 Jam') && rule.nama_sub_kriteria.includes('24 Jam')) {
                    return score;
                }
                // Default value untuk jam terbatas (bisa disesuaikan)
                if (!rawValue.includes('24 Jam') && rule.nama_sub_kriteria.includes('Pagi')) {
                     return 3; 
                }
            }
            // C. Logika Angka Normal (Harga, Jarak, Rating)
            else {
                if (rawValue >= min && rawValue <= max) {
                    return score;
                }
            }
        }
        return 1; // Nilai default jika data tidak masuk range manapun
      };

      // --- HITUNG BOBOT KRITERIA DENGAN AHP ---
      const kriteriaIds = dbKriteria
        .map((k) => Number(k.id_kriteria))
        .sort((a, b) => a - b);
      const n = kriteriaIds.length;
      const expectedPairCount = (n * (n - 1)) / 2;

      if (n > MAX_AHP_CRITERIA) {
        await trx.rollback();
        return res.status(400).json({
          status: API_STATUS.BAD_REQUEST,
          message: `Jumlah kriteria melebihi batas AHP yang didukung (maksimal ${MAX_AHP_CRITERIA}).`
        });
      }

      if (Object.keys(perbandinganAHP).length < expectedPairCount) {
        await trx.rollback();
        return res.status(400).json({
          status: API_STATUS.BAD_REQUEST,
          message: 'Data perbandingan AHP belum lengkap untuk semua pasangan kriteria'
        });
      }

      const matrix = Array.from({ length: n }, () => Array(n).fill(1));

      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const idA = kriteriaIds[i];
          const idB = kriteriaIds[j];
          const pairKey = `${idA}-${idB}`;
          const pairData = perbandinganAHP[pairKey];

          if (!pairData) {
            await trx.rollback();
            return res.status(400).json({
              status: API_STATUS.BAD_REQUEST,
              message: `Data perbandingan untuk pasangan ${pairKey} belum diisi`
            });
          }

          const intensity = Number(pairData.intensity);
          const moreImportant = pairData.moreImportant;
          const isEqual = moreImportant === 'equal';

          if (!isEqual && ![idA, idB].includes(Number(moreImportant))) {
            await trx.rollback();
            return res.status(400).json({
              status: API_STATUS.BAD_REQUEST,
              message: `Nilai lebih penting untuk pasangan ${pairKey} tidak valid`
            });
          }

          if (!Number.isFinite(intensity) || intensity < 1 || intensity > 9) {
            await trx.rollback();
            return res.status(400).json({
              status: API_STATUS.BAD_REQUEST,
              message: `Skala perbandingan AHP untuk pasangan ${pairKey} harus 1-9`
            });
          }

          let valueAtoB = 1;
          if (!isEqual) {
            valueAtoB = Number(moreImportant) === idA ? intensity : 1 / intensity;
          }

          matrix[i][j] = valueAtoB;
          matrix[j][i] = 1 / valueAtoB;
        }
      }

      const columnTotals = Array.from({ length: n }, (_, colIdx) =>
        matrix.reduce((acc, row) => acc + row[colIdx], 0)
      );
      const normalizedMatrix = matrix.map((row) =>
        row.map((value, colIdx) => (columnTotals[colIdx] === 0 ? 0 : value / columnTotals[colIdx]))
      );
      const ahpWeights = normalizedMatrix.map((row) =>
        row.reduce((sum, val) => sum + val, 0) / n
      );

      const weightedSums = matrix.map((row) =>
        row.reduce((sum, value, colIdx) => sum + (value * ahpWeights[colIdx]), 0)
      );

      const lambdaMax = weightedSums.reduce((sum, weightedSum, rowIdx) => {
        const weight = ahpWeights[rowIdx];
        return sum + (weight === 0 ? 0 : (weightedSum / weight));
      }, 0) / n;

      const ci = n > 1 ? (lambdaMax - n) / (n - 1) : 0;
      const ri = AHP_RI_TABLE[n] ?? AHP_RI_TABLE[MAX_AHP_CRITERIA];
      const cr = ri === 0 ? 0 : ci / ri;

      if (cr > AHP_CR_THRESHOLD) {
        await trx.rollback();
        return res.status(400).json({
          status: API_STATUS.BAD_REQUEST,
          message: `Perbandingan yang Anda masukkan tidak konsisten (Rasio Konsistensi/CR=${cr.toFixed(4)}). Silakan periksa kembali nilai perbandingan antar kriteria.`,
          data: {
            consistency_ratio: Number(cr.toFixed(4)),
            consistency_index: Number(ci.toFixed(4)),
            lambda_max: Number(lambdaMax.toFixed(4))
          }
        });
      }

      const weightByKriteriaId = {};
      kriteriaIds.forEach((id, idx) => {
        weightByKriteriaId[id] = ahpWeights[idx];
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

      // --- SIMPAN TOP 5 KE DATABASE ---
      const top5 = finalResult.slice(0, 5); 
      const dataToInsert = top5.map((item, index) => ({
        id_preferensi: preferensiId,
        id_alternatif: item.id_alternatif,
        skor_akhir_wp: Number(item.skor_rekomendasi),
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
          fasilitas: item.fasilitas,
          waktu_kunjungan: item.waktu_kunjungan,
          jarak_dari_anda: item.jarak_dari_anda,
          skor_rekomendasi: item.skor_rekomendasi
      }));

      // Commit Transaksi (Simpan Permanen)
      await trx.commit();

      return res.json({
        status: API_STATUS.SUCCESS,
        message: 'Perhitungan AHP + SMART selesai',
        data: {
          id_riwayat: preferensiId,
          bobot_ahp: kriteriaIds.map((id, index) => ({
            id_kriteria: id,
            bobot: Number(ahpWeights[index].toFixed(6))
          })),
          consistency_ratio: Number(cr.toFixed(4)),
          [RESPONSE_DATA_KEYS.REKOMENDASI]: responseData
        }
      });

    } catch (error) {
      await trx.rollback();
      console.error("Error Hitung AHP+SMART:", error);
      return res.status(500).json({ message: 'Gagal menghitung rekomendasi AHP + SMART' });
    }
  },

  // ... (BAGIAN BAWAH: GET RIWAYAT SAYA & ADMIN BIARKAN SAMA, TIDAK PERLU DIUBAH) ...
  // ... Paste fungsi getRiwayatSaya & getAllRiwayat di sini ...
  
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
            'hasil_rekomendasi.skor_akhir_wp',
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
            skor: parseFloat(item.skor_akhir_wp).toFixed(4),
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
      return res.status(500).json({ message: 'Gagal mengambil riwayat' });
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
            db.raw('AVG(hasil_rekomendasi.skor_akhir_wp) as rata_rata_skor'),
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
      return res.status(500).json({ message: 'Gagal mengambil laporan analitik' });
    }
  }
};
