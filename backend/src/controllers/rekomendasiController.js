// src/controllers/rekomendasiController.js
const db = require('../database/connection').db;
const { TABLES } = require('../constants/database');
const { API_STATUS, RESPONSE_DATA_KEYS } = require('../constants/general');
const spkHelper = require('../utils/spkHelper');

const SCORE_COLUMN_CANDIDATES = ['skor_akhir_wp', 'skor_rekomendasi'];

const getHasilRekomendasiScoreColumn = async () => {
  for (const column of SCORE_COLUMN_CANDIDATES) {
    const exists = await db.schema.hasColumn(TABLES.HASIL_REKOMENDASI, column);
    if (exists) return column;
  }
  return 'skor_akhir_wp';
};

module.exports = {

  hitungRekomendasi: async (req, res) => {
    // 1. INISIALISASI TRANSACTION
    const trx = await db.transaction();

    try {
      const { id: userId } = req.user;
      const { userLocation } = req.body;

      // --- VALIDASI INPUT ---
      if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
        await trx.rollback();
        return res.status(400).json({
          status: API_STATUS.BAD_REQUEST,
          message: 'Lokasi User (Latitude & Longitude) wajib dikirim!'
        });
      }

      // --- AMBIL DATA DARI DATABASE (PRE-FETCHING) ---
      // Kita ambil semua data yang dibutuhkan di awal agar cepat (hindari query dalam loop)
      const wisataRaw = await trx(TABLES.WISATA).select('*');
      const dbKriteria = await trx('kriteria').select('*');         // Untuk cek Cost/Benefit
      const dbSubKriteria = await trx('sub_kriteria').select('*');  // Untuk Range Nilai (1-5)
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

      // --- MAPPING KOLOM ---
      // Memberitahu sistem: ID Kriteria 1 itu kolom apa di tabel wisata?
      const colMapper = {
        1: 'harga_tiket',
        2: 'fasilitas', // Tetap pakai nama kolom DB lama untuk kompatibilitas data lama
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

            // A. Logika Atraksi Wisata (Hitung Jumlah Item string)
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

      // --- BOBOT ADMIN (HASIL AHP) DARI TABEL KRITERIA ---
      const totalBobotAdmin = dbKriteria.reduce((sum, k) => sum + Number(k.bobot_prioritas || 0), 0);
      if (totalBobotAdmin <= 0) {
        await trx.rollback();
        return res.status(400).json({
          status: API_STATUS.BAD_REQUEST,
          message: 'Bobot kriteria belum diatur admin. Silakan admin menghitung bobot AHP terlebih dahulu.'
        });
      }
      const weightByKriteriaId = {};
      kriteriaIds.forEach((id, idx) => {
        const kriteria = dbKriteria.find((k) => Number(k.id_kriteria) === id);
        const rawWeight = Number(kriteria?.bobot_prioritas || 0);
        weightByKriteriaId[id] = rawWeight / totalBobotAdmin;
      });

      // --- SIMPAN RIWAYAT USER + SNAPSHOT BOBOT ADMIN ---
      const adminBobotSnapshot = kriteriaIds.map((id) => ({
        id_kriteria: id,
        bobot: Number((weightByKriteriaId[id] || 0).toFixed(6))
      }));
      const [preferensiId] = await trx('preferensi_wisatawan').insert({
        id_wisatawan: userId,
        user_latitude: userLocation.latitude,
        user_longitude: userLocation.longitude,
        data_preferensi: JSON.stringify({ bobot_admin: adminBobotSnapshot }),
        created_at: new Date()
      });

      await trx(TABLES.RIWAYAT_PENCARIAN).insert({
        id_wisatawan: userId,
        detail_pencarian: JSON.stringify({ userLocation, bobot_admin: adminBobotSnapshot }),
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

      // --- SIMPAN TOP 5 KE DATABASE ---
      const top5 = finalResult.slice(0, 5); 
      const scoreColumn = await getHasilRekomendasiScoreColumn();
      const dataToInsert = top5.map((item, index) => ({
        id_preferensi: preferensiId,
        id_alternatif: item.id_alternatif,
        [scoreColumn]: Number(item.skor_rekomendasi),
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
          atraksi_wisata: item.fasilitas,
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
            bobot: Number((weightByKriteriaId[id] || 0).toFixed(6))
          })),
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
      const scoreColumn = await getHasilRekomendasiScoreColumn();
      
      const data = await db(TABLES.HASIL_REKOMENDASI)
        .join('preferensi_wisatawan', 'hasil_rekomendasi.id_preferensi', '=', 'preferensi_wisatawan.id_preferensi')
        .join('alternatif_wisata', 'hasil_rekomendasi.id_alternatif', '=', 'alternatif_wisata.id_alternatif')
        .where('preferensi_wisatawan.id_wisatawan', id) 
        .where('hasil_rekomendasi.ranking', 1)          
        .select(
            'preferensi_wisatawan.created_at as tanggal',
            'alternatif_wisata.nama_wisata as rekomendasi_utama',
            'alternatif_wisata.rating_gmaps',
            `hasil_rekomendasi.${scoreColumn} as skor_akhir`,
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
      return res.status(500).json({ message: 'Gagal mengambil riwayat' });
    }
  },

  // [GET] SEMUA RIWAYAT (Admin Only)
  getAllRiwayat: async (req, res) => {
    try {
      const scoreColumn = await getHasilRekomendasiScoreColumn();
      // Hitung jumlah wisatawan unik yang pernah melakukan perhitungan
      const wisatawanCountResult = await db('preferensi_wisatawan')
        .countDistinct('id_wisatawan as total')
        .first();

      const data = await db(TABLES.HASIL_REKOMENDASI)
        .join(TABLES.WISATA, `${TABLES.HASIL_REKOMENDASI}.id_alternatif`, '=', `${TABLES.WISATA}.id_alternatif`)
        .select(
            `${TABLES.WISATA}.nama_wisata`,
            db.raw(`AVG(${TABLES.HASIL_REKOMENDASI}.${scoreColumn}) as rata_rata_skor`),
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
