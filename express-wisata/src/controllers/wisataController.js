// src/controllers/wisataController.js
const db = require('../database/connection').db;

// Import Constants langsung dari file masing-masing
const { WISATA_TABLE } = require('../constants/database');
const { API_STATUS, RESPONSE_DATA_KEYS } = require('../constants/general');

module.exports = {
  // GET /api/v1/wisata (List Semua)
  getAllWisata: async (req, res) => {
    try {
      // Mengambil semua data dari tabel alternatif_wisata
      const data = await db(WISATA_TABLE).select('*');
      
      return res.json({
        status: API_STATUS.SUCCESS,
        message: 'Daftar Wisata berhasil dimuat',
        data: {
          // Hasilnya akan jadi -> "list_wisata": [ ...data... ]
          [RESPONSE_DATA_KEYS.WISATA]: data 
        }
      });
    } catch (error) {
      console.error("Error Get All Wisata:", error);
      return res.status(500).json({ 
        status: API_STATUS.FAILED,
        message: 'Server Error saat mengambil data wisata' 
      });
    }
  },

  // GET /api/v1/wisata/:id (Detail Satu)
  getDetailWisata: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Mengambil satu baris berdasarkan id_alternatif
      const data = await db(WISATA_TABLE).where('id_alternatif', id).first();

      if (!data) {
        return res.status(404).json({ 
            status: API_STATUS.NOT_FOUND, 
            message: 'Wisata tidak ditemukan' 
        });
      }

      return res.json({
        status: API_STATUS.SUCCESS,
        message: 'Detail Wisata ditemukan',
        data: {
          // Hasilnya akan jadi -> "detail_wisata": { ...object... }
          [RESPONSE_DATA_KEYS.WISATA_DETAIL]: data
        }
      });
    } catch (error) {
      console.error("Error Get Detail Wisata:", error);
      return res.status(500).json({ 
        status: API_STATUS.FAILED,
        message: 'Server Error saat mengambil detail wisata' 
      });
    }
  }
};