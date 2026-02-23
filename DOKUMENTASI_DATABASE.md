# Dokumentasi Struktur Database SPK Wisata

## Ringkasan Sistem

Sistem ini adalah **Sistem Pendukung Keputusan (SPK)** untuk rekomendasi wisata di Magetan menggunakan metode **Weighted Product (WP)**. Database dirancang untuk menyimpan data wisata, kriteria penilaian, preferensi wisatawan, dan hasil rekomendasi.

---

## Daftar Tabel

1. **admin** - Data administrator sistem
2. **wisatawan** - Data pengguna/wisatawan
3. **alternatif_wisata** - Data tempat wisata
4. **kriteria** - Kriteria penilaian wisata
5. **sub_kriteria** - Sub-kategori dari setiap kriteria
6. **preferensi_wisatawan** - Preferensi wisatawan saat mencari rekomendasi
7. **hasil_rekomendasi** - Hasil perhitungan rekomendasi
8. **riwayat_pencarian** - Riwayat pencarian wisatawan
9. **token_blacklist** - Token JWT yang sudah tidak valid (logout)

---

## Detail Struktur Tabel

### 1. Tabel: `admin`

**Fungsi:** Menyimpan data administrator yang dapat mengelola sistem (CRUD wisata, kriteria, dll)

**Kolom:**
- `id_admin` (INT, PK, AUTO_INCREMENT) - ID unik admin
- `username` (VARCHAR 100, NOT NULL) - Nama pengguna admin
- `email` (VARCHAR 100, NOT NULL) - Email admin
- `password` (VARCHAR 255, NOT NULL) - Password terenkripsi (bcrypt)
- `created_at` (TIMESTAMP) - Waktu pembuatan akun
- `updated_at` (TIMESTAMP) - Waktu terakhir update

**Relasi:** Tidak ada relasi dengan tabel lain (tabel independen)

**Catatan:** Tabel ini berfungsi dengan baik untuk autentikasi admin.

---

### 2. Tabel: `wisatawan`

**Fungsi:** Menyimpan data wisatawan/pengguna yang mencari rekomendasi wisata

**Kolom:**
- `id_wisatawan` (INT, PK, AUTO_INCREMENT) - ID unik wisatawan
- `username` (VARCHAR 50, NOT NULL) - Nama pengguna wisatawan
- `email` (VARCHAR 100, NOT NULL) - Email wisatawan
- `password` (VARCHAR 255, NOT NULL) - Password terenkripsi
- `created_at` (TIMESTAMP) - Waktu pembuatan akun
- `updated_at` (TIMESTAMP) - Waktu terakhir update

**Relasi:**
- **Ke `preferensi_wisatawan`**: 1 wisatawan dapat memiliki banyak preferensi (1:N)
  - Foreign Key: `id_wisatawan` di tabel `preferensi_wisatawan`
  - Digunakan untuk: Melacak siapa yang membuat preferensi
  
- **Ke `riwayat_pencarian`**: 1 wisatawan dapat memiliki banyak riwayat (1:N)
  - Foreign Key: `id_wisatawan` di tabel `riwayat_pencarian`
  - Digunakan untuk: Menyimpan riwayat pencarian per wisatawan

**Catatan:** Tabel ini berfungsi dengan baik untuk autentikasi dan tracking user.

---

### 3. Tabel: `alternatif_wisata`

**Fungsi:** Menyimpan data tempat wisata yang akan direkomendasikan

**Kolom:**
- `id_alternatif` (INT, PK, AUTO_INCREMENT) - ID unik wisata
- `nama_wisata` (VARCHAR 100, NOT NULL) - Nama tempat wisata
- `deskripsi` (TEXT, NULLABLE) - Deskripsi wisata
- `gambar` (VARCHAR 255, NULLABLE) - Path/URL gambar wisata
- `latitude` (DOUBLE, NOT NULL) - Koordinat latitude
- `longitude` (DOUBLE, NOT NULL) - Koordinat longitude
- `rating_gmaps` (DOUBLE, NOT NULL) - Rating Google Maps (1.0 - 5.0)
- `harga_tiket` (DOUBLE, NOT NULL) - Harga tiket masuk (dalam Rupiah)
- `fasilitas` (TEXT, NOT NULL) - Daftar fasilitas (comma-separated atau JSON)
- `waktu_kunjungan` (VARCHAR 100, NOT NULL) - Jam operasional (misal: "08.00 - 17.00")
- `created_at` (TIMESTAMP) - Waktu data dibuat
- `updated_at` (TIMESTAMP) - Waktu terakhir update

**Relasi:**
- **Ke `hasil_rekomendasi`**: 1 wisata dapat muncul di banyak hasil (1:N)
  - Foreign Key: `id_alternatif` di tabel `hasil_rekomendasi`
  - Digunakan untuk: Menampilkan detail wisata yang direkomendasikan

**Catatan:** 
- Kolom `latitude` dan `longitude` digunakan untuk menghitung jarak dari lokasi user
- Kolom `rating_gmaps`, `harga_tiket`, `fasilitas`, `waktu_kunjungan` adalah nilai kriteria untuk perhitungan WP
- Semua kolom berfungsi dengan baik

---

### 4. Tabel: `kriteria`

**Fungsi:** Menyimpan kriteria penilaian wisata (Harga, Fasilitas, Jarak, Rating, Waktu Kunjungan)

**Kolom:**
- `id_kriteria` (INT, PK, AUTO_INCREMENT) - ID unik kriteria
- `nama_kriteria` (VARCHAR 50, NOT NULL) - Nama kriteria (misal: "Harga Tiket")
- `bobot_prioritas` (FLOAT, NOT NULL) - Bobot kriteria (0.0 - 1.0, total semua = 1.0)
- `jenis` (ENUM 'cost'/'benefit', NOT NULL) - Jenis kriteria
  - **cost**: Semakin kecil semakin baik (misal: Harga, Jarak)
  - **benefit**: Semakin besar semakin baik (misal: Rating, Fasilitas)
- `deskripsi` (TEXT, NULLABLE) - Pertanyaan preferensi untuk user (ditambahkan kemudian)
- `created_at` (TIMESTAMP) - Waktu data dibuat
- `updated_at` (TIMESTAMP) - Waktu terakhir update

**Relasi:**
- **Ke `sub_kriteria`**: 1 kriteria memiliki banyak sub-kriteria (1:N)
  - Foreign Key: `id_kriteria` di tabel `sub_kriteria`
  - Digunakan untuk: Mengelompokkan sub-kriteria berdasarkan kriteria induk

**Data Default:**
1. Harga Tiket (bobot: 0.30, jenis: cost)
2. Fasilitas (bobot: 0.25, jenis: benefit)
3. Jarak (bobot: 0.20, jenis: cost)
4. Rating (bobot: 0.15, jenis: benefit)
5. Waktu Kunjungan (bobot: 0.10, jenis: benefit)

**Catatan:** 
- Kolom `deskripsi` ditambahkan untuk menyimpan pertanyaan preferensi
- Semua kolom berfungsi dengan baik

---

### 5. Tabel: `sub_kriteria`

**Fungsi:** Menyimpan kategori/rentang nilai untuk setiap kriteria

**Kolom:**
- `id_sub` (INT, PK, AUTO_INCREMENT) - ID unik sub-kriteria
- `code_kriteria` (VARCHAR 10, NOT NULL) - Kode kriteria (misal: "C1", "C2")
- `id_kriteria` (INT, FK, NOT NULL) - Referensi ke tabel `kriteria`
- `nama_sub_kriteria` (VARCHAR 100, NOT NULL) - Nama kategori (misal: "Sangat Murah")
- `nilai_bobot` (INT, NOT NULL) - Bobot nilai kategori (1-5)
- `batas_bawah` (VARCHAR 50, NULLABLE) - Batas bawah rentang (DIUBAH dari DOUBLE ke VARCHAR)
- `batas_atas` (VARCHAR 50, NULLABLE) - Batas atas rentang (DIUBAH dari DOUBLE ke VARCHAR)
- `created_at` (TIMESTAMP) - Waktu data dibuat
- `updated_at` (TIMESTAMP) - Waktu terakhir update

**Relasi:**
- **Dari `kriteria`**: Merupakan child dari tabel kriteria
  - Foreign Key: `id_kriteria` → `kriteria.id_kriteria` (ON DELETE CASCADE)
  - Digunakan untuk: Mengelompokkan sub-kriteria per kriteria
  
- **Ke `preferensi_wisatawan`**: Digunakan untuk menyimpan pilihan user
  - Foreign Key: `id_sub_harga`, `id_sub_fasilitas`, `id_sub_waktu_kunjungan`, `id_sub_rating`
  - Digunakan untuk: Menyimpan preferensi user untuk setiap kriteria

**Contoh Data:**

**Untuk Kriteria Harga (id_kriteria = 1):**
- Sangat Murah (< 20rb) - bobot: 1, batas: 0 - 20000
- Murah (20rb - 50rb) - bobot: 2, batas: 20001 - 50000
- Sedang (50rb - 100rb) - bobot: 3, batas: 50001 - 100000
- Mahal (100rb - 200rb) - bobot: 4, batas: 100001 - 200000
- Sangat Mahal (> 200rb) - bobot: 5, batas: 200001 - 10000000

**Untuk Kriteria Waktu Kunjungan (id_kriteria = 5):**
- Pagi (08:00 - 12:00) - bobot: 5, batas: "8" - "12"
- Siang (12:00 - 15:00) - bobot: 4, batas: "12.1" - "15"
- Sore (15:00 - 18:00) - bobot: 3, batas: "15.1" - "18"
- Malam (18:00 - 22:00) - bobot: 2, batas: "18.1" - "22"
- Bebas / 24 Jam - bobot: 1, batas: "24 jam" atau text lain

**Catatan:** 
- Kolom `batas_bawah` dan `batas_atas` DIUBAH dari DOUBLE ke VARCHAR(50) untuk mendukung format text seperti "09.00", "24 jam"
- Kolom `code_kriteria` mungkin redundan karena sudah ada `id_kriteria` (bisa dihapus jika tidak digunakan)
- Semua kolom lainnya berfungsi dengan baik

---

### 6. Tabel: `preferensi_wisatawan`

**Fungsi:** Menyimpan preferensi wisatawan saat mencari rekomendasi wisata

**Kolom:**
- `id_preferensi` (INT, PK, AUTO_INCREMENT) - ID unik preferensi
- `id_wisatawan` (INT, FK, NOT NULL) - Referensi ke tabel `wisatawan`
- `waktu_akses` (DATETIME, DEFAULT NOW) - Waktu akses/pencarian
- `user_latitude` (DOUBLE, NOT NULL) - Koordinat latitude user
- `user_longitude` (DOUBLE, NOT NULL) - Koordinat longitude user
- `data_preferensi` (TEXT, NULLABLE) - Data preferensi dalam format JSON
- `id_sub_harga` (INT, FK, NULLABLE) - Pilihan sub-kriteria harga
- `id_sub_fasilitas` (INT, FK, NULLABLE) - Pilihan sub-kriteria fasilitas
- `id_sub_waktu_kunjungan` (INT, FK, NULLABLE) - Pilihan sub-kriteria waktu kunjungan
- `id_sub_rating` (INT, FK, NULLABLE) - Pilihan sub-kriteria rating
- `created_at` (TIMESTAMP) - Waktu data dibuat
- `updated_at` (TIMESTAMP) - Waktu terakhir update

**Relasi:**
- **Dari `wisatawan`**: Merupakan preferensi dari wisatawan tertentu
  - Foreign Key: `id_wisatawan` → `wisatawan.id_wisatawan` (ON DELETE CASCADE)
  - Digunakan untuk: Melacak siapa yang membuat preferensi
  
- **Dari `sub_kriteria`**: Menyimpan pilihan sub-kriteria untuk setiap kriteria
  - Foreign Key: `id_sub_harga` → `sub_kriteria.id_sub`
  - Foreign Key: `id_sub_fasilitas` → `sub_kriteria.id_sub`
  - Foreign Key: `id_sub_waktu_kunjungan` → `sub_kriteria.id_sub`
  - Foreign Key: `id_sub_rating` → `sub_kriteria.id_sub`
  - Digunakan untuk: Mengetahui preferensi user untuk perhitungan WP
  
- **Ke `hasil_rekomendasi`**: 1 preferensi menghasilkan banyak hasil rekomendasi (1:N)
  - Foreign Key: `id_preferensi` di tabel `hasil_rekomendasi`
  - Digunakan untuk: Mengelompokkan hasil rekomendasi per preferensi

**Catatan:**
- Kolom `user_latitude` dan `user_longitude` digunakan untuk menghitung jarak ke wisata
- Kolom `data_preferensi` mungkin redundan karena sudah ada kolom `id_sub_*` yang terpisah
- **MISSING:** Tidak ada kolom untuk kriteria Jarak (id_kriteria = 3). Ini mungkin bug atau jarak dihitung otomatis dari koordinat user.
- Semua kolom lainnya berfungsi dengan baik

---

### 7. Tabel: `hasil_rekomendasi`

**Fungsi:** Menyimpan hasil perhitungan rekomendasi wisata menggunakan metode WP

**Kolom:**
- `id_hasil` (INT, PK, AUTO_INCREMENT) - ID unik hasil
- `id_preferensi` (INT, FK, NOT NULL) - Referensi ke tabel `preferensi_wisatawan`
- `id_alternatif` (INT, FK, NOT NULL) - Referensi ke tabel `alternatif_wisata`
- `jarak_km_hasil` (DOUBLE, NOT NULL) - Jarak dari user ke wisata (dalam km)
- `skor_akhir_wp` (DOUBLE, NOT NULL) - Skor hasil perhitungan Weighted Product
- `ranking` (INT, NOT NULL) - Peringkat wisata (1 = terbaik)
- `created_at` (TIMESTAMP) - Waktu data dibuat
- `updated_at` (TIMESTAMP) - Waktu terakhir update

**Relasi:**
- **Dari `preferensi_wisatawan`**: Merupakan hasil dari preferensi tertentu
  - Foreign Key: `id_preferensi` → `preferensi_wisatawan.id_preferensi` (ON DELETE CASCADE)
  - Digunakan untuk: Mengelompokkan hasil per sesi pencarian
  
- **Dari `alternatif_wisata`**: Berisi wisata yang direkomendasikan
  - Foreign Key: `id_alternatif` → `alternatif_wisata.id_alternatif` (ON DELETE CASCADE)
  - Digunakan untuk: Menampilkan detail wisata yang direkomendasikan

**Catatan:** 
- Tabel ini menyimpan hasil perhitungan, sehingga user bisa melihat hasil lama tanpa perlu hitung ulang
- Semua kolom berfungsi dengan baik

---

### 8. Tabel: `riwayat_pencarian`

**Fungsi:** Menyimpan riwayat pencarian wisatawan (log aktivitas)

**Kolom:**
- `id_riwayat` (INT, PK, AUTO_INCREMENT) - ID unik riwayat
- `id_wisatawan` (INT, FK, NOT NULL) - Referensi ke tabel `wisatawan`
- `detail_pencarian` (TEXT, NOT NULL) - Detail pencarian dalam format JSON
- `created_at` (TIMESTAMP) - Waktu pencarian
- `updated_at` (TIMESTAMP) - Waktu terakhir update

**Relasi:**
- **Dari `wisatawan`**: Merupakan riwayat dari wisatawan tertentu
  - Foreign Key: `id_wisatawan` → `wisatawan.id_wisatawan` (ON DELETE CASCADE)
  - Digunakan untuk: Melacak riwayat pencarian per user

**Catatan:** 
- Kolom `detail_pencarian` menyimpan data preferensi dalam format JSON string
- **Potensi Duplikasi:** Fungsinya mirip dengan tabel `preferensi_wisatawan`
- Tabel ini mungkin hanya untuk log/analitik, bukan untuk fungsionalitas utama

---

### 9. Tabel: `token_blacklist`

**Fungsi:** Menyimpan JWT token yang sudah di-logout (blacklist)

**Kolom:**
- `id` (INT, PK, AUTO_INCREMENT) - ID unik record
- `token` (VARCHAR 500, NOT NULL, INDEXED) - JWT token yang di-blacklist
- `created_at` (TIMESTAMP, DEFAULT NOW) - Waktu token di-blacklist

**Relasi:** Tidak ada relasi dengan tabel lain (tabel independen)

**Catatan:** 
- Tabel ini digunakan untuk keamanan, memastikan token yang sudah logout tidak bisa digunakan lagi
- Column `token` di-index untuk mempercepat pencarian
- Semua kolom berfungsi dengan baik

---

## Diagram Relasi (ERD)

```
┌─────────────┐
│   admin     │
└─────────────┘
(Independen, tidak ada relasi)

┌──────────────┐         ┌────────────────────────┐
│  wisatawan   │────┬───→│ preferensi_wisatawan   │
└──────────────┘    │    └────────────────────────┘
                    │              │
                    │              │ (1:N)
                    │              ↓
                    │    ┌────────────────────┐
                    │    │ hasil_rekomendasi  │
                    │    └────────────────────┘
                    │              ↑
                    │              │
                    │    ┌─────────┴────────────┐
                    │    │  alternatif_wisata   │
                    │    └──────────────────────┘
                    │
                    └───→┌────────────────────┐
                         │ riwayat_pencarian  │
                         └────────────────────┘

┌─────────────┐         ┌──────────────┐
│  kriteria   │────────→│ sub_kriteria │
└─────────────┘  (1:N)  └──────────────┘
                               ↑
                               │ (4 FK)
                               │
                    ┌──────────┴──────────┐
                    │ preferensi_wisatawan │
                    └─────────────────────┘

┌─────────────────┐
│ token_blacklist │
└─────────────────┘
(Independen, tidak ada relasi)
```

---

## Ringkasan Relasi Antar Tabel

### 1. **wisatawan → preferensi_wisatawan** (1:N)
- **Kolom:** `wisatawan.id_wisatawan` ← `preferensi_wisatawan.id_wisatawan`
- **Tujuan:** Melacak siapa yang membuat preferensi pencarian
- **Data yang diambil:** Informasi wisatawan (username, email) untuk ditampilkan di halaman preferensi

### 2. **wisatawan → riwayat_pencarian** (1:N)
- **Kolom:** `wisatawan.id_wisatawan` ← `riwayat_pencarian.id_wisatawan`
- **Tujuan:** Menyimpan log riwayat pencarian per wisatawan
- **Data yang diambil:** Informasi wisatawan untuk menampilkan riwayat

### 3. **kriteria → sub_kriteria** (1:N)
- **Kolom:** `kriteria.id_kriteria` ← `sub_kriteria.id_kriteria`
- **Tujuan:** Mengelompokkan sub-kriteria berdasarkan kriteria induk
- **Data yang diambil:** Nama kriteria dan jenis (cost/benefit) untuk perhitungan WP

### 4. **sub_kriteria → preferensi_wisatawan** (N:1, 4 relasi)
- **Kolom:** 
  - `sub_kriteria.id_sub` ← `preferensi_wisatawan.id_sub_harga`
  - `sub_kriteria.id_sub` ← `preferensi_wisatawan.id_sub_fasilitas`
  - `sub_kriteria.id_sub` ← `preferensi_wisatawan.id_sub_waktu_kunjungan`
  - `sub_kriteria.id_sub` ← `preferensi_wisatawan.id_sub_rating`
- **Tujuan:** Menyimpan pilihan preferensi user untuk setiap kriteria
- **Data yang diambil:** Nama sub-kriteria dan nilai bobot untuk perhitungan WP

### 5. **preferensi_wisatawan → hasil_rekomendasi** (1:N)
- **Kolom:** `preferensi_wisatawan.id_preferensi` ← `hasil_rekomendasi.id_preferensi`
- **Tujuan:** Mengelompokkan hasil rekomendasi per sesi pencarian
- **Data yang diambil:** Data preferensi untuk menampilkan konteks pencarian

### 6. **alternatif_wisata → hasil_rekomendasi** (1:N)
- **Kolom:** `alternatif_wisata.id_alternatif` ← `hasil_rekomendasi.id_alternatif`
- **Tujuan:** Menampilkan wisata yang direkomendasikan
- **Data yang diambil:** Semua detail wisata (nama, gambar, rating, harga, fasilitas, dll)

---

## Analisis Kolom dan Tabel

### ✅ Kolom yang Berfungsi dengan Baik

**Semua tabel dan hampir semua kolom berfungsi dengan baik.** Tidak ada kolom yang benar-benar tidak terpakai.

### ⚠️ Kolom yang Berpotensi Redundan

1. **`sub_kriteria.code_kriteria`**
   - **Status:** Mungkin redundan
   - **Alasan:** Sudah ada `id_kriteria` untuk identifikasi kriteria
   - **Rekomendasi:** Bisa dihapus jika tidak digunakan di kode, atau tetap dipertahankan jika digunakan untuk display/label

2. **`preferensi_wisatawan.data_preferensi`**
   - **Status:** Mungkin redundan
   - **Alasan:** Sudah ada kolom terpisah (`id_sub_harga`, `id_sub_fasilitas`, dll)
   - **Rekomendasi:** 
     - Jika kolom ini berisi data yang sama dengan kolom `id_sub_*`, maka redundan
     - Jika berisi data tambahan (misal: catatan user), maka berguna

### ❌ Kolom yang Hilang (Missing)

1. **`preferensi_wisatawan` tidak ada kolom untuk Kriteria Jarak**
   - **Missing:** `id_sub_jarak` atau sejenisnya
   - **Dampak:** User tidak bisa memilih preferensi jarak
   - **Solusi saat ini:** Jarak dihitung otomatis dari `user_latitude` dan `user_longitude` ke semua wisata
   - **Rekomendasi:** 
     - Jika jarak dihitung otomatis, ini tidak masalah
     - Jika user harus memilih preferensi jarak (misal: "dekat", "sedang", "jauh"), perlu ditambahkan kolom `id_sub_jarak`

### ⚠️ Tabel yang Berpotensi Duplikasi

1. **`riwayat_pencarian` vs `preferensi_wisatawan`**
   - **Fungsi mirip:** Keduanya menyimpan data pencarian wisatawan
   - **Perbedaan:** 
     - `preferensi_wisatawan`: Lebih terstruktur dengan FK ke sub_kriteria
     - `riwayat_pencarian`: Lebih sederhana, hanya JSON log
   - **Rekomendasi:** 
     - Pertahankan keduanya jika `riwayat_pencarian` hanya untuk log/analitik
     - Gabungkan jika fungsinya sama persis

---

## Kesimpulan

### Kelebihan Desain Database:
1. ✅ Struktur relasi jelas dan terorganisir dengan baik
2. ✅ Penggunaan Foreign Key dengan CASCADE untuk menjaga integritas data
3. ✅ Timestamp (`created_at`, `updated_at`) di semua tabel untuk audit trail
4. ✅ Pemisahan tabel admin dan wisatawan untuk keamanan
5. ✅ Mendukung metode Weighted Product dengan baik

### Yang Perlu Diperhatikan:
1. ⚠️ Kolom `sub_kriteria.code_kriteria` mungkin redundan
2. ⚠️ Kolom `preferensi_wisatawan.data_preferensi` mungkin duplikasi
3. ⚠️ Tidak ada kolom `id_sub_jarak` di `preferensi_wisatawan` (jika diperlukan)
4. ⚠️ Tabel `riwayat_pencarian` mungkin duplikasi fungsi dengan `preferensi_wisatawan`
5. ⚠️ Kolom `batas_bawah` dan `batas_atas` diubah ke VARCHAR untuk mendukung text seperti "24 jam"

### Rekomendasi:
1. Pertahankan desain saat ini jika sudah berjalan dengan baik
2. Hapus kolom redundan hanya jika benar-benar tidak digunakan di kode
3. Tambahkan dokumentasi inline di kode untuk menjelaskan kolom yang mungkin membingungkan
4. Pertimbangkan menambahkan index di kolom yang sering di-query (misal: `wisatawan.email`, `alternatif_wisata.nama_wisata`)

---

**Dokumentasi ini dibuat pada:** 2026-02-18  
**Versi Database:** Berdasarkan migration terakhir `20260218020000_change_batas_to_string.js`  
**Total Tabel:** 9 tabel  
**Total Relasi:** 8 relasi (Foreign Key)
