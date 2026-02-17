# Express Wisata - Backend API

Backend API untuk Sistem Pendukung Keputusan (SPK) Wisata menggunakan metode **Weighted Product (WP)**.

## Tech Stack

- **Framework**: Express.js
- **Database**: MySQL (via Knex.js)
- **Autentikasi**: JWT + bcryptjs
- **Validasi**: Joi

## Struktur Direktori

```
express-wisata/
├── knexfile.js                 # Konfigurasi Knex (database)
├── package.json
└── src/
    ├── app.js                  # Entry point aplikasi
    ├── app.routes.js           # Registrasi semua route (/api/v1)
    ├── config/
    │   └── cors.js             # Konfigurasi CORS
    ├── constants/
    │   ├── database.js         # Nama tabel & konstanta DB
    │   └── general.js          # Status code, role, response key
    ├── controllers/
    │   ├── authController.js       # Register, login, logout, update profil
    │   ├── wisataController.js     # Data wisata (publik)
    │   ├── kriteriaController.js   # CRUD kriteria & sub-kriteria
    │   ├── alternatifController.js # CRUD alternatif wisata
    │   └── rekomendasiController.js # Algoritma WP & riwayat
    ├── database/
    │   ├── connection.js       # Instance koneksi Knex
    │   ├── migrations/         # 10 file migrasi
    │   └── seeds/              # 7 file seed (20 lokasi wisata)
    ├── middleware/
    │   └── auth.js             # Verifikasi JWT & role-based auth
    ├── routes/
    │   ├── authRoute.js
    │   ├── wisataRoute.js
    │   ├── alternatifRoute.js
    │   ├── adminRoute.js
    │   ├── rekomendasiRoute.js
    │   └── dashboardRoute.js
    ├── service/
    │   ├── api.js              # Axios instance
    │   └── auth.service.js     # Service login
    └── utils/
        ├── jwt.js              # Generate & verifikasi token JWT
        ├── wpHelper.js         # Algoritma Weighted Product
        └── dateUtils.js        # Format tanggal
```

## Instalasi

```bash
cd express-wisata
npm install
```

## Konfigurasi

Buat file `.env` di root `express-wisata/`:

```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=spk_wisata_db
JWT_SECRET=your_jwt_secret
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

## Menjalankan

```bash
# Development (dengan nodemon)
npm run dev

# Production
npm start
```

## Migrasi & Seed Database

```bash
# Jalankan migrasi
npm run migrate

# Rollback migrasi
npm run migrate:rollback

# Jalankan seed data
npm run seed
```

## API Endpoints

### Auth
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/v1/auth/register` | ❌ | Registrasi wisatawan baru |
| POST | `/api/v1/auth/login` | ❌ | Login (admin/wisatawan) |
| PUT | `/api/v1/auth/profile` | ✅ | Update profil |
| POST | `/api/v1/auth/logout` | ✅ | Logout & blacklist token |

### Wisata (Publik)
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/v1/wisata` | ❌ | Daftar semua lokasi wisata |
| GET | `/api/v1/wisata/:id` | ❌ | Detail lokasi wisata |

### Admin - Kriteria
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/v1/admin/kriteria` | ✅ Admin | Daftar kriteria |
| POST | `/api/v1/admin/kriteria` | ✅ Admin | Tambah kriteria |
| PUT | `/api/v1/admin/kriteria/:id` | ✅ Admin | Update kriteria |
| DELETE | `/api/v1/admin/kriteria/:id` | ✅ Admin | Hapus kriteria |
| PUT | `/api/v1/admin/subkriteria/:id` | ✅ Admin | Update sub-kriteria |

### Admin - Wisata
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/v1/admin/wisata` | ✅ Admin | Daftar wisata (admin) |
| POST | `/api/v1/admin/wisata` | ✅ Admin | Tambah lokasi wisata |
| PUT | `/api/v1/admin/wisata/:id` | ✅ Admin | Update lokasi wisata |
| DELETE | `/api/v1/admin/wisata/:id` | ✅ Admin | Hapus lokasi wisata |

### Rekomendasi
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/v1/rekomendasi/hitung` | ✅ | Hitung rekomendasi (WP) |
| GET | `/api/v1/rekomendasi/riwayat/me` | ✅ | Riwayat pencarian user |
| GET | `/api/v1/rekomendasi/riwayat` | ✅ Admin | Semua riwayat pencarian |
