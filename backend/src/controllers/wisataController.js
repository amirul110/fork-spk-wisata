const db = require('../database/connection').db;
const { WISATA_TABLE } = require('../constants/database');
const { API_STATUS, RESPONSE_DATA_KEYS } = require('../constants/general');

module.exports = {
  getAllWisata: async (req, res) => {
    try {
      const data = await db(WISATA_TABLE).select('*');

      const ids = data.map((w) => w.id_alternatif);
      const gambarArr = ids.length
        ? await db('wisata_gambar').whereIn('id_alternatif', ids).orderBy('urutan')
        : [];

      const result = data.map((w) => ({
        ...w,
        gambar_list: gambarArr.filter((g) => g.id_alternatif === w.id_alternatif),
      }));

      return res.json({
        status: API_STATUS.SUCCESS,
        message: 'Daftar Wisata berhasil dimuat',
        data: { [RESPONSE_DATA_KEYS.WISATA]: result },
      });
    } catch (error) {
      console.error('Error Get All Wisata:', error);
      return res.status(500).json({ status: API_STATUS.FAILED, message: 'Server Error' });
    }
  },

  getDetailWisata: async (req, res) => {
    try {
      const { id } = req.params;
      const data = await db(WISATA_TABLE).where('id_alternatif', id).first();

      if (!data) {
        return res.status(404).json({ status: API_STATUS.NOT_FOUND, message: 'Wisata tidak ditemukan' });
      }

      const gambarArr = await db('wisata_gambar').where('id_alternatif', id).orderBy('urutan');

      return res.json({
        status: API_STATUS.SUCCESS,
        message: 'Detail Wisata ditemukan',
        data: {
          [RESPONSE_DATA_KEYS.WISATA_DETAIL]: { ...data, gambar_list: gambarArr },
        },
      });
    } catch (error) {
      console.error('Error Get Detail Wisata:', error);
      return res.status(500).json({ status: API_STATUS.FAILED, message: 'Server Error' });
    }
  },
};