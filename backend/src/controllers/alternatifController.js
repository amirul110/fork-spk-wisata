const db = require('../database/connection').db;
const { TABLES } = require('../constants/database');
const { API_STATUS } = require('../constants/general');

// Helper: ambil gambar_list untuk array id wisata
async function getGambarList(idList) {
  if (!idList.length) return [];
  return db('wisata_gambar')
    .whereIn('id_alternatif', idList)
    .orderBy('id_alternatif')
    .orderBy('urutan');
}

// Helper: attach gambar_list ke array wisata
function attachGambar(wisataArr, gambarArr) {
  return wisataArr.map((w) => ({
    ...w,
    gambar_list: gambarArr.filter((g) => g.id_alternatif === w.id_alternatif),
  }));
}

module.exports = {

  // [GET] SEMUA DATA
  getAllAlternatif: async (req, res) => {
    try {
      const data = await db(TABLES.WISATA).select('*').orderBy('created_at', 'asc');
      const gambarArr = await getGambarList(data.map((w) => w.id_alternatif));
      return res.json({
        status: API_STATUS.SUCCESS,
        message: 'Berhasil mengambil seluruh data wisata',
        total_data: data.length,
        data: attachGambar(data, gambarArr),
      });
    } catch (error) {
      console.error('Error Get All Alternatif:', error);
      return res.status(500).json({ message: 'Gagal mengambil data wisata' });
    }
  },

  // [GET] 1 DATA BY ID
  getAlternatifById: async (req, res) => {
    try {
      const { id } = req.params;
      const data = await db(TABLES.WISATA).where('id_alternatif', id).first();
      if (!data) return res.status(404).json({ message: 'Data wisata tidak ditemukan' });

      const gambarArr = await db('wisata_gambar')
        .where('id_alternatif', id)
        .orderBy('urutan');

      return res.json({
        status: API_STATUS.SUCCESS,
        data: { ...data, gambar_list: gambarArr },
      });
    } catch (error) {
      console.error('Error Get Alternatif By ID:', error);
      return res.status(500).json({ message: 'Gagal mengambil detail wisata' });
    }
  },

  // [POST] TAMBAH DATA BARU
  createAlternatif: async (req, res) => {
    try {
      const { nama_wisata, latitude, longitude, harga_tiket, atraksi_wisata, rating_gmaps, deskripsi } = req.body;

      if (!nama_wisata || !latitude || !longitude) {
        return res.status(400).json({ message: 'Nama dan Lokasi (Lat/Long) wajib diisi!' });
      }

      // Gambar pertama sebagai gambar utama (backwards-compatible)
      const files = req.files || [];
      const gambarUtama = files.length > 0 ? files[0].filename : null;

      const [newId] = await db(TABLES.WISATA).insert({
        nama_wisata,
        latitude,
        longitude,
        harga_tiket: harga_tiket || 0,
        atraksi_wisata: atraksi_wisata || '',
        rating_gmaps: rating_gmaps || 0,
        deskripsi: deskripsi || '',
        gambar: gambarUtama,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Simpan semua gambar ke wisata_gambar
      if (files.length > 0) {
        const gambarInserts = files.map((f, i) => ({
          id_alternatif: newId,
          nama_file: f.filename,
          urutan: i,
          created_at: new Date(),
          updated_at: new Date(),
        }));
        await db('wisata_gambar').insert(gambarInserts);
      }

      const newData = await db(TABLES.WISATA).where('id_alternatif', newId).first();
      const gambarArr = await db('wisata_gambar').where('id_alternatif', newId).orderBy('urutan');

      return res.status(201).json({
        status: API_STATUS.SUCCESS,
        message: 'Berhasil menambahkan wisata baru',
        data: { ...newData, gambar_list: gambarArr },
      });
    } catch (error) {
      console.error('Error Create Alternatif:', error);
      return res.status(500).json({ message: 'Gagal menambahkan data wisata' });
    }
  },

  // [PUT] UPDATE DATA
  updateAlternatif: async (req, res) => {
    try {
      const { id } = req.params;
      const { nama_wisata, latitude, longitude, harga_tiket, atraksi_wisata, rating_gmaps, deskripsi } = req.body;

      const exists = await db(TABLES.WISATA).where('id_alternatif', id).first();
      if (!exists) return res.status(404).json({ message: 'Data wisata tidak ditemukan' });

      const updateData = {
        nama_wisata,
        latitude,
        longitude,
        harga_tiket,
        atraksi_wisata,
        rating_gmaps,
        deskripsi: deskripsi || '',
        updated_at: new Date(),
      };

      // Tambahkan gambar baru tanpa menghapus yang lama
      const files = req.files || [];
      if (files.length > 0) {
        const existingCount = await db('wisata_gambar')
          .where('id_alternatif', id)
          .count('* as count')
          .first();
        const startUrutan = Number(existingCount.count);

        const gambarInserts = files.map((f, i) => ({
          id_alternatif: id,
          nama_file: f.filename,
          urutan: startUrutan + i,
          created_at: new Date(),
          updated_at: new Date(),
        }));
        await db('wisata_gambar').insert(gambarInserts);

        // Update gambar utama jika belum ada
        if (!exists.gambar) {
          updateData.gambar = files[0].filename;
        }
      }

      await db(TABLES.WISATA).where('id_alternatif', id).update(updateData);

      const updatedData = await db(TABLES.WISATA).where('id_alternatif', id).first();
      const gambarArr = await db('wisata_gambar').where('id_alternatif', id).orderBy('urutan');

      return res.json({
        status: API_STATUS.SUCCESS,
        message: 'Berhasil mengupdate data wisata',
        data: { ...updatedData, gambar_list: gambarArr },
      });
    } catch (error) {
      console.error('Error Update Alternatif:', error);
      return res.status(500).json({ message: 'Gagal mengupdate data wisata' });
    }
  },

  // [DELETE] HAPUS WISATA
  deleteAlternatif: async (req, res) => {
    try {
      const { id } = req.params;
      const exists = await db(TABLES.WISATA).where('id_alternatif', id).first();
      if (!exists) return res.status(404).json({ message: 'Data wisata tidak ditemukan' });

      // wisata_gambar akan terhapus otomatis via CASCADE
      await db(TABLES.WISATA).where('id_alternatif', id).del();

      return res.json({ status: API_STATUS.SUCCESS, message: 'Data wisata berhasil dihapus' });
    } catch (error) {
      console.error('Error Delete Alternatif:', error);
      return res.status(500).json({ message: 'Gagal menghapus data wisata' });
    }
  },

  // [DELETE] HAPUS 1 GAMBAR SPESIFIK
  deleteGambarById: async (req, res) => {
    try {
      const { gambarId } = req.params;
      const gambar = await db('wisata_gambar').where('id', gambarId).first();
      if (!gambar) return res.status(404).json({ message: 'Gambar tidak ditemukan' });

      await db('wisata_gambar').where('id', gambarId).del();

      return res.json({ status: API_STATUS.SUCCESS, message: 'Gambar berhasil dihapus' });
    } catch (error) {
      console.error('Error Delete Gambar:', error);
      return res.status(500).json({ message: 'Gagal menghapus gambar' });
    }
  },
};