// src/controllers/kriteriaController.js
const db = require('../database/connection').db;

// Import Constants
const { KRITERIA_TABLE, SUB_KRITERIA_TABLE } = require('../constants/database');
const { API_STATUS, RESPONSE_DATA_KEYS } = require('../constants/general');

// Helper untuk batas: kembalikan apa adanya supaya format "09.00", "24 jam" terjaga
const parseBatasValue = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return typeof value === 'string' ? value.trim() : String(value);
};

module.exports = {
  // GET /api/v1/kriteria
  getAllKriteria: async (req, res) => {
    try {
      const data = await db(KRITERIA_TABLE)
        .select('id_kriteria', 'nama_kriteria', 'jenis')
        .orderBy('id_kriteria', 'asc');

      return res.json({
        status: API_STATUS.SUCCESS,
        message: 'Data Kriteria berhasil diambil',
        data: {
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
  getSubKriteriaByKriteria: async (req, res) => {
    try {
      const { id } = req.params;

      const detailKriteria = await db(KRITERIA_TABLE)
        .where('id_kriteria', id)
        .first();

      if (!detailKriteria) {
        return res.status(404).json({
          status: API_STATUS.NOT_FOUND,
          message: 'Kriteria tidak ditemukan.'
        });
      }

      const listSub = await db(SUB_KRITERIA_TABLE)
        .where('id_kriteria', id)
        .select('*')
        .orderBy('nilai_bobot', 'asc');

      return res.json({
        status: API_STATUS.SUCCESS,
        message: 'Data Sub-Kriteria berhasil diambil',
        data: {
          kriteria: detailKriteria,
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
      const { nama_kriteria, jenis } = req.body;

      if (!nama_kriteria || !jenis) {
        return res.status(400).json({
          status: API_STATUS.BAD_REQUEST,
          message: 'Field nama_kriteria dan jenis wajib diisi'
        });
      }

      await db(KRITERIA_TABLE).insert({
        nama_kriteria,
        jenis,            // 'cost' atau 'benefit'
        bobot_prioritas: 0 // default; bobot asli dihitung dari preferensi user (AHP)
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

  // [PUT] Update Kriteria (hanya nama & jenis)
  updateKriteria: async (req, res) => {
    try {
      const { id } = req.params;
      const { nama_kriteria, jenis } = req.body;

      const payload = { updated_at: new Date() };
      if (nama_kriteria !== undefined) payload.nama_kriteria = nama_kriteria;
      if (jenis !== undefined) payload.jenis = jenis;

      await db(KRITERIA_TABLE)
        .where('id_kriteria', id)
        .update(payload);

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

      await db(SUB_KRITERIA_TABLE).where('id_kriteria', id).del();
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
        return res.status(400).json({
          status: API_STATUS.BAD_REQUEST,
          message: 'Field id_kriteria, nama_sub_kriteria, dan nilai_bobot wajib diisi'
        });
      }

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
      const { id } = req.params; // id_sub
      const { nama_sub_kriteria, nilai_bobot, batas_bawah, batas_atas } = req.body;

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