// src/controllers/rekomendasiController.js
const db = require('../database/connection').db;
const { TABLES } = require('../constants/database');
const { API_STATUS, RESPONSE_DATA_KEYS } = require('../constants/general');
const wpHelper = require('../utils/wpHelper'); 

module.exports = {

  hitungRekomendasi: async (req, res) => {
    // 1. INISIALISASI TRANSACTION
    const trx = await db.transaction();

    try {
      const { id: userId } = req.user;
      const { preferensi, userLocation } = req.body;

      // --- VALIDASI INPUT ---
      if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
        await trx.rollback();
        return res.status(400).json({
          status: API_STATUS.BAD_REQUEST,
          message: 'Lokasi User (Latitude & Longitude) wajib dikirim!'
        });
      }

      if (!preferensi) {
        await trx.rollback();
        return res.status(400).json({ message: 'Preferensi kriteria wajib diisi' });
      }

      // --- SIMPAN PREFERENSI USER ---
      const [preferensiId] = await trx('preferensi_wisatawan').insert({
        id_wisatawan: userId,
        user_latitude: userLocation.latitude,
        user_longitude: userLocation.longitude,
        data_preferensi: JSON.stringify(preferensi),
        created_at: new Date()
      });

      // Simpan Log (Backup)
      await trx(TABLES.RIWAYAT_PENCARIAN).insert({
        id_wisatawan: userId,
        detail_pencarian: JSON.stringify({ preferensi, userLocation }),
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

      // --- PERSIAPAN BOBOT ---
      let totalBobotInput = 0;
      Object.values(preferensi).forEach(val => totalBobotInput += Number(val));

      // --- HITUNG WP (VECTOR S) ---
      let vectorS_List = [];
      let totalVectorS = 0;

      const candidates = wisataRaw.map(w => {
        // 1. Hitung Jarak Real (User ke Wisata)
        const jarakKm = wpHelper.hitungJarakKm(
          Number(userLocation.latitude), Number(userLocation.longitude), 
          w.latitude, w.longitude
        );

        let nilaiS = 1;

        // 2. Loop Setiap Kriteria User
        Object.keys(preferensi).forEach(kID => {
            const bobotUser = Number(preferensi[kID]);
            
            if (bobotUser > 0) { // Hanya hitung jika user memilih
                const colName = colMapper[kID];
                
                // Tentukan nilai asli (Raw)
                let rawValue = (colName === 'jarak_real') ? jarakKm : w[colName];

                // A. Cari Nilai Utility (1-5) menggunakan Data Database
                const nilaiUtility = getScoreFromDb(kID, rawValue);

                // B. Normalisasi Bobot User
                let bobotW = bobotUser / totalBobotInput;

                // C. Cek Tipe COST/BENEFIT dari Database
                const kriteriaInfo = dbKriteria.find(k => k.id_kriteria == kID);
                
                if (kriteriaInfo && kriteriaInfo.jenis === 'cost') {
                     // Jika Cost (misal Harga): Pangkat harus NEGATIF
                     // Karena: Nilai 1 (Murah) dipangkatkan -1 hasilnya Besar (Bagus).
                     // Nilai 5 (Mahal) dipangkatkan -1 hasilnya Kecil (Jelek).
                     bobotW = -1 * bobotW; 
                }

                // Rumus WP: S = S * (Nilai ^ Bobot)
                nilaiS = nilaiS * Math.pow(nilaiUtility, bobotW);
            }
        });

        // Simpan hasil sementara
        const resultItem = { ...w, jarak_km: jarakKm, vector_s: nilaiS };
        vectorS_List.push(resultItem);
        totalVectorS += nilaiS;
        return resultItem;
      });

      // --- HITUNG VECTOR V (Ranking Akhir) ---
      const finalResult = vectorS_List.map(item => ({
         ...item,
         // Rumus V: Skor Alternatif / Total Semua Skor
         skor_rekomendasi: totalVectorS > 0 ? (item.vector_s / totalVectorS).toFixed(4) : 0,
         jarak_dari_anda: item.jarak_km.toFixed(2) + " KM"
      }));

      // Sort Ranking (Besar ke Kecil)
      finalResult.sort((a, b) => b.skor_rekomendasi - a.skor_rekomendasi);

      // --- SIMPAN TOP 5 KE DATABASE ---
      const top5 = finalResult.slice(0, 5); 
      const dataToInsert = top5.map((item, index) => ({
        id_preferensi: preferensiId,
        id_alternatif: item.id_alternatif,
        skor_akhir_wp: item.skor_rekomendasi,
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
        message: 'Perhitungan Weighted Product Selesai',
        data: {
          id_riwayat: preferensiId,
          [RESPONSE_DATA_KEYS.REKOMENDASI]: responseData
        }
      });

    } catch (error) {
      await trx.rollback();
      console.error("Error Hitung WP:", error);
      return res.status(500).json({ message: 'Gagal menghitung rekomendasi WP' });
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
            info: "Ini adalah rekomendasi terbaik berdasarkan preferensi Anda saat itu."
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