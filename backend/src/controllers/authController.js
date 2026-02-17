// src/controllers/authController.js
const bcrypt = require('bcryptjs')
const db = require('../database/connection').db
const { generateToken } = require('../utils/jwt')
const { getFormattedDate } = require('../utils/dateUtils') // Pastikan ini sudah ada
const { TABLES } = require('../constants/database')
const { API_STATUS, ROLES } = require('../constants/general')

module.exports = {
  // --- REGISTER (Khusus Wisatawan) ---
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body

      if (!username || !email || !password) {
        return res.status(400).json({
          status: API_STATUS.ERROR,
          message: 'Username, Email, dan Password wajib diisi!'
        })
      }

      // Cek Email Kembar
      const existingUser = await db(TABLES.WISATAWAN)
        .where('email', email)
        .first()
      if (existingUser) {
        return res.status(400).json({
          status: API_STATUS.ERROR,
          message: 'Email sudah terdaftar!'
        })
      }

      // Enkripsi Password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      // Simpan ke Database
      const [newId] = await db(TABLES.WISATAWAN).insert({
        username,
        email,
        password: hashedPassword
      })

      // RESPON SUKSES REGISTER (REQUEST ANDA: Ganti username jadi role)
      return res.status(201).json({
        status: API_STATUS.SUCCESS, // "00"
        message: 'Registrasi berhasil',
        datetime: getFormattedDate(),
        data: {
          id: newId,
          email: email,
          username: username,
          role: ROLES.WISATAWAN // <--- Diganti jadi Role (Hardcode 'wisatawan' karena register publik pasti wisatawan)
        }
      })
    } catch (error) {
      console.error('Register Error:', error)
      return res.status(500).json({ message: 'Server Error saat Register' })
    }
  },

  // --- LOGIN (Admin & Wisatawan) ---
  login: async (req, res) => {
    try {
      const { email, password } = req.body

      // Validasi Input
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: 'Email dan Password wajib diisi' })
      }

      // ==========================================
      // 1. DEKLARASI VARIABEL (KUNCI PERBAIKAN ERROR)
      // ==========================================
      // Kita harus bikin "wadah" kosong dulu di sini agar bisa dipakai di bawah
      let user = null
      let role = null
      let userId = null // <--- INI WAJIB ADA AGAR TIDAK 'REFERENCE ERROR'

      // ==========================================
      // 2. CEK TABEL ADMIN
      // ==========================================
      try {
        const adminUser = await db(TABLES.ADMIN).where('email', email).first()
        if (adminUser) {
          user = adminUser
          role = ROLES.ADMIN
          userId = adminUser.id_admin // Simpan ID Admin ke wadah userId
        }
      } catch (err) {
        // Abaikan jika tabel admin belum ada/kosong
      }

      // ==========================================
      // 3. JIKA BUKAN ADMIN, CEK WISATAWAN
      // ==========================================
      if (!user) {
        const wisatawanUser = await db(TABLES.WISATAWAN)
          .where('email', email)
          .first()
        if (wisatawanUser) {
          user = wisatawanUser
          role = ROLES.WISATAWAN
          userId = wisatawanUser.id_wisatawan // Simpan ID Wisatawan ke wadah userId
        }
      }

      // ==========================================
      // 4. HASIL PENGECEKAN
      // ==========================================

      // A. Jika user tidak ditemukan sama sekali
      if (!user) {
        return res.status(404).json({
          status: API_STATUS.NOT_FOUND,
          message: 'Email tidak terdaftar.'
        })
      }

      // B. Cek Password
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        return res.status(401).json({
          status: API_STATUS.UNAUTHORIZED,
          message: 'Password salah!'
        })
      }

      // C. Buat Token (Pastikan userId sudah terisi)
      const token = generateToken({
        id: userId, // Di sini error terjadi kalau userId belum dideklarasikan di atas
        email: user.email,
        role: role,
        username: user.username
      })

      // D. Kirim Response Sukses
      return res.json({
        status: API_STATUS.SUCCESS, // "00"
        message: 'Login berhasil',
        datetime: getFormattedDate(),
        auth: {
          token: token,
          user: {
            id: userId,
            email: user.email,
            username: user.username,
            role: role
          }
        }
      })
    } catch (error) {
      console.error('Login Error:', error)
      return res
        .status(500)
        .json({ message: 'Terjadi kesalahan server saat login' })
    }
  },

  updateProfile: async (req, res) => {
    try {
      // Data dari Token (hasil kerja Middleware)
      const { id, role } = req.user
      // Data yang mau diubah (dari Body Postman)
      const { username, email, password } = req.body

      // 1. Tentukan mau update tabel mana (Admin / Wisatawan)
      const table = role === ROLES.ADMIN ? TABLES.ADMIN : TABLES.WISATAWAN
      const idColumn = role === ROLES.ADMIN ? 'id_admin' : 'id_wisatawan'

      // 2. Siapkan wadah data yang mau diupdate
      const updateData = {}

      // Hanya update jika user mengisi data (Kalau kosong, jangan diubah)
      if (username) updateData.username = username
      if (email) updateData.email = email

      // Khusus Password: Harus di-hash dulu
      if (password) {
        const salt = await bcrypt.genSalt(10)
        updateData.password = await bcrypt.hash(password, salt)
      }

      updateData.updated_at = new Date() // Update timestamp

      // 3. Eksekusi Update ke Database
      await db(table).where(idColumn, id).update(updateData)

      // 4. Ambil data terbaru untuk ditampilkan (Tanpa Password)
      const updatedUser = await db(table).where(idColumn, id).first()

      // Hapus password dari respon agar aman
      delete updatedUser.password

      return res.json({
        status: API_STATUS.SUCCESS,
        message: 'Profil berhasil diperbarui',
        datetime: getFormattedDate(),
        data: updatedUser
      })
    } catch (error) {
      console.error('Update Profile Error:', error)
      return res.status(500).json({ message: 'Gagal mengupdate profil' })
    }
  },

  // --- LOGOUT (POST) ---
  logout: async (req, res) => {
    try {
      // 1. Ambil token dari header
      const authHeader = req.headers['authorization']
      const token = authHeader && authHeader.split(' ')[1]

      // 2. Masukkan ke Database Blacklist
      if (token) {
        await db('token_blacklist').insert({ token: token })
      }

      // 3. Beri respon sukses
      return res.json({
        status: API_STATUS.SUCCESS,
        message: 'Logout berhasil. Token telah hangus. Silahkan login lagi',
        datetime: getFormattedDate()
      })
    } catch (error) {
      console.error('Logout Error:', error)
      return res.status(500).json({ message: 'Gagal logout' })
    }
  }
}
