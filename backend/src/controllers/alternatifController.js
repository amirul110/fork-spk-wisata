// src/controllers/alternatifController.js
const db = require('../database/connection').db;
const { TABLES } = require('../constants/database');
const { API_STATUS } = require('../constants/general');

module.exports = {
  
  // [GET] AMBIL SEMUA DATA (READ) - Untuk Tampilan Tabel Admin
  getAllAlternatif: async (req, res) => {
    try {
      const data = await db(TABLES.WISATA)
        .select('*')
        .orderBy('created_at', 'asc'); // Urutkan dari yang terbaru

      return res.json({
        status: API_STATUS.SUCCESS,
        message: 'Berhasil mengambil seluruh data wisata',
        total_data: data.length,
        data: data
      });
    } catch (error) {
      console.error("Error Get All Alternatif:", error);
      return res.status(500).json({ message: 'Gagal mengambil data wisata' });
    }
  },

  // [GET] AMBIL 1 DATA BY ID (READ) - Untuk Form Edit
  getAlternatifById: async (req, res) => {
    try {
      const { id } = req.params;
      const data = await db(TABLES.WISATA).where('id_alternatif', id).first();

      if (!data) {
        return res.status(404).json({ message: 'Data wisata tidak ditemukan' });
      }

      return res.json({
        status: API_STATUS.SUCCESS,
        data
      });
    } catch (error) {
      console.error("Error Get Alternatif By ID:", error);
      return res.status(500).json({ message: 'Gagal mengambil detail wisata' });
    }
  },

  // [POST] TAMBAH DATA BARU (CREATE)
  createAlternatif: async (req, res) => {
    try {
      const { 
        nama_wisata, latitude, longitude, 
        harga_tiket, atraksi_wisata, rating_gmaps,
        deskripsi
      } = req.body;

      if (!nama_wisata || !latitude || !longitude) {
        return res.status(400).json({ message: 'Nama dan Lokasi (Lat/Long) wajib diisi!' });
      }

      // Get uploaded file path if exists
      const gambar = req.file ? req.file.filename : null;

      // 1. Insert ke database
      const [newId] = await db(TABLES.WISATA).insert({
        nama_wisata,
        latitude,
        longitude,
        harga_tiket: harga_tiket || 0,
        atraksi_wisata: atraksi_wisata || '',
        rating_gmaps: rating_gmaps || 0,
        deskripsi: deskripsi || '',
        gambar: gambar,
        created_at: new Date(),
        updated_at: new Date()
      });

      // 2. Ambil Data yang barusan dibuat (Agar muncul di respon JSON)
      const newData = await db(TABLES.WISATA).where('id_alternatif', newId).first();

      return res.status(201).json({
        status: API_STATUS.SUCCESS,
        message: 'Berhasil menambahkan wisata baru',
        data: newData
      });

    } catch (error) {
      console.error("Error Create Alternatif:", error);
      return res.status(500).json({ message: 'Gagal menambahkan data wisata' });
    }
  },

  // [PUT] UPDATE DATA (UPDATE)
  updateAlternatif: async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        nama_wisata, latitude, longitude, 
        harga_tiket, atraksi_wisata, rating_gmaps,
        deskripsi
      } = req.body;

      const exists = await db(TABLES.WISATA).where('id_alternatif', id).first();
      if (!exists) {
        return res.status(404).json({ message: 'Data wisata tidak ditemukan' });
      }

      // Prepare update data
      const updateData = {
        nama_wisata,
        latitude,
        longitude,
        harga_tiket,
        atraksi_wisata,
        rating_gmaps,
        deskripsi: deskripsi || '',
        updated_at: new Date()
      };

      // Add image if uploaded
      if (req.file) {
        updateData.gambar = req.file.filename;
      }

      // 1. Lakukan Update
      await db(TABLES.WISATA).where('id_alternatif', id).update(updateData);

      // 2. Ambil Data Terbaru setelah diupdate
      const updatedData = await db(TABLES.WISATA).where('id_alternatif', id).first();

      return res.json({
        status: API_STATUS.SUCCESS,
        message: 'Berhasil mengupdate data wisata',
        data: updatedData
      });

    } catch (error) {
      console.error("Error Update Alternatif:", error);
      return res.status(500).json({ message: 'Gagal mengupdate data wisata' });
    }
  },

  // [DELETE] HAPUS DATA (DELETE)
  deleteAlternatif: async (req, res) => {
    try {
      const { id } = req.params;

      // Cek data
      const exists = await db(TABLES.WISATA).where('id_alternatif', id).first();
      if (!exists) {
        return res.status(404).json({ message: 'Data wisata tidak ditemukan' });
      }

      // Delete (Karena di migrasi sudah ON DELETE CASCADE, maka data di hasil_rekomendasi juga akan hilang otomatis)
      await db(TABLES.WISATA).where('id_alternatif', id).del();

      return res.json({
        status: API_STATUS.SUCCESS,
        message: 'Data wisata berhasil dihapus'
      });

    } catch (error) {
      console.error("Error Delete Alternatif:", error);
      return res.status(500).json({ message: 'Gagal menghapus data wisata' });
    }
  }
};
