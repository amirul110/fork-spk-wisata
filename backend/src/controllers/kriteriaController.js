// src/controllers/kriteriaController.js
const db = require('../database/connection').db;

// Import Constants
const { KRITERIA_TABLE, SUB_KRITERIA_TABLE } = require('../constants/database');
const { API_STATUS, RESPONSE_DATA_KEYS } = require('../constants/general');

module.exports = {
  // GET /api/v1/kriteria
  // Digunakan Frontend untuk membuat Label Dropdown Form SPK
  getAllKriteria: async (req, res) => {
    try {
      const data = await db(KRITERIA_TABLE)
        .select(
            'id_kriteria', 
            'nama_kriteria', 
            'jenis',          // cost / benefit
            'bobot_prioritas',
            'deskripsi'       // Tambah deskripsi untuk preferensi
        ) 
        .orderBy('id_kriteria', 'asc');

      return res.json({
        status: API_STATUS.SUCCESS,
        message: 'Data Kriteria berhasil diambil',
        data: {
          // Hasilnya akan jadi -> "list_kriteria": [ ... ]
          [RESPONSE_DATA_KEYS.KRITERIA]: data
        }
      });
    } catch (error) {
      console.error("Error Get Kriteria:", error);
      return res.status(500).json({ 
        status: API_STATUS.FAILED,
        message: 'Gagal mengambil data kriteria' 
      });
    }
  },

  // GET /api/v1/subkriteria/:id
  // Menampilkan pilihan (dropdown options) berdasarkan kriteria yang dipilih
  getSubKriteriaByKriteria: async (req, res) => {
    try {
      const { id } = req.params;

      // 1. AMBIL INFO KRITERIA (INDUKNYA) DULU
      // Supaya kita tahu ID sekian itu namanya apa (Misal: "Harga Tiket")
      const detailKriteria = await db(KRITERIA_TABLE)
        .where('id_kriteria', id)
        .first();

      // Validasi: Kalau kriterianya gak ada, stop.
      if (!detailKriteria) {
        return res.status(404).json({
          status: API_STATUS.NOT_FOUND,
          message: 'Kriteria tidak ditemukan.'
        });
      }

      // 2. AMBIL LIST SUB-KRITERIA (ANAKNYA)
      const listSub = await db(SUB_KRITERIA_TABLE)
        .where('id_kriteria', id)
        .select('*')
        .orderBy('nilai_bobot', 'asc'); // Sesuai kolom di database Anda

      // 3. GABUNGKAN DALAM RESPON JSON
      return res.json({
        status: API_STATUS.SUCCESS,
        message: 'Data Sub-Kriteria berhasil diambil',
        data: {
          // Info Induk (Supaya frontend gak bingung)
          kriteria: detailKriteria, 
          // Info Anak
          [RESPONSE_DATA_KEYS.SUB_KRITERIA]: listSub
        }
      });

    } catch (error) {
      console.error("Error Get Sub-Kriteria:", error);
      return res.status(500).json({ 
          status: API_STATUS.FAILED,
          message: 'Terjadi kesalahan server'
      });
    }
  },

  // [POST] Tambah Kriteria Baru
  createKriteria: async (req, res) => {
    try {
      const { nama_kriteria, jenis, bobot_prioritas, deskripsi } = req.body;

      // Validasi sederhana
      if (!nama_kriteria || !jenis || !bobot_prioritas) {
        return res.status(400).json({ status: API_STATUS.BAD_REQUEST, message: 'Semua field wajib diisi' });
      }

      await db(KRITERIA_TABLE).insert({
        nama_kriteria,
        jenis, // 'cost' atau 'benefit'
        bobot_prioritas,
        deskripsi: deskripsi || null // Optional field
      });

      return res.status(201).json({
        status: API_STATUS.SUCCESS,
        message: 'Kriteria berhasil ditambahkan'
      });
    } catch (error) {
      console.error("Error Create Kriteria:", error);
      return res.status(500).json({ message: 'Gagal menambah kriteria', error: error.message });
    }
  },

  // [PUT] Update Kriteria
  updateKriteria: async (req, res) => {
    try {
      const { id } = req.params; // id_kriteria dari URL
      const { nama_kriteria, jenis, bobot_prioritas, deskripsi } = req.body;

      await db(KRITERIA_TABLE)
        .where('id_kriteria', id)
        .update({
          nama_kriteria,
          jenis,
          bobot_prioritas,
          deskripsi: deskripsi || null,
          updated_at: new Date()
        });

      return res.json({
        status: API_STATUS.SUCCESS,
        message: 'Kriteria berhasil diupdate'
      });
    } catch (error) {
      console.error("Error Update Kriteria:", error);
      return res.status(500).json({ message: 'Gagal update kriteria' });
    }
  },

  // [DELETE] Hapus Kriteria
  deleteKriteria: async (req, res) => {
    try {
      const { id } = req.params;

      // Hapus anak-anaknya (sub_kriteria) dulu agar tidak error constraint
      await db(SUB_KRITERIA_TABLE).where('id_kriteria', id).del();
      
      // Baru hapus bapaknya
      await db(KRITERIA_TABLE).where('id_kriteria', id).del();

      return res.json({
        status: API_STATUS.SUCCESS,
        message: 'Kriteria dan Sub-kriterianya berhasil dihapus'
      });
    } catch (error) {
      console.error("Error Delete Kriteria:", error);
      return res.status(500).json({ message: 'Gagal menghapus kriteria' });
    }
  },

  // [POST] Tambah Sub-Kriteria Baru
  createSubKriteria: async (req, res) => {
    try {
      const { id_kriteria, code_kriteria, nama_sub_kriteria, nilai_bobot, batas_bawah, batas_atas } = req.body;

      if (!id_kriteria || !nama_sub_kriteria || nilai_bobot === undefined || nilai_bobot === null) {
        return res.status(400).json({ status: API_STATUS.BAD_REQUEST, message: 'Field id_kriteria, nama_sub_kriteria, dan nilai_bobot wajib diisi' });
      }

      // Parse batas_bawah and batas_atas to handle string inputs
      const parseBatasValue = (value) => {
        if (value === null || value === undefined || value === '') return null;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
      };

      await db(SUB_KRITERIA_TABLE).insert({
        id_kriteria,
        code_kriteria: code_kriteria || '',
        nama_sub_kriteria,
        nilai_bobot,
        batas_bawah: parseBatasValue(batas_bawah),
        batas_atas: parseBatasValue(batas_atas)
      });

      return res.status(201).json({
        status: API_STATUS.SUCCESS,
        message: 'Sub-Kriteria berhasil ditambahkan'
      });
    } catch (error) {
      console.error("Error Create Sub-Kriteria:", error);
      return res.status(500).json({ message: 'Gagal menambah sub-kriteria', error: error.message });
    }
  },

  // [DELETE] Hapus Sub-Kriteria
  deleteSubKriteria: async (req, res) => {
    try {
      const { id } = req.params;

      const deleted = await db(SUB_KRITERIA_TABLE).where('id_sub', id).del();

      if (!deleted) {
        return res.status(404).json({
          status: API_STATUS.NOT_FOUND,
          message: 'Sub-Kriteria tidak ditemukan'
        });
      }

      return res.json({
        status: API_STATUS.SUCCESS,
        message: 'Sub-Kriteria berhasil dihapus'
      });
    } catch (error) {
      console.error("Error Delete Sub-Kriteria:", error);
      return res.status(500).json({ message: 'Gagal menghapus sub-kriteria' });
    }
  },

  // [PUT] Update Sub-Kriteria (Nilai/Nama)
  updateSubKriteria: async (req, res) => {
    try {
      const { id } = req.params; // id_sub (bukan id_kriteria)
      const { nama_sub_kriteria, nilai_bobot, batas_bawah, batas_atas } = req.body;

      // Parse batas_bawah and batas_atas to handle string inputs
      const parseBatasValue = (value) => {
        if (value === null || value === undefined || value === '') return null;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
      };

      await db(SUB_KRITERIA_TABLE)
        .where('id_sub', id)
        .update({
          nama_sub_kriteria,
          nilai_bobot,
          batas_bawah: parseBatasValue(batas_bawah),
          batas_atas: parseBatasValue(batas_atas),
          updated_at: new Date()
        });

      return res.json({
        status: API_STATUS.SUCCESS,
        message: 'Sub-Kriteria berhasil diupdate'
      });
    } catch (error) {
      console.error("Error Update Sub-Kriteria:", error);
      return res.status(500).json({ message: 'Gagal update sub-kriteria' });
    }
  }
};