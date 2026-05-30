# SOLUSI

Dokumen ini menjelaskan 3 hal:

1. Perbaikan konten yang "tenggelam" / terpotong navbar di tampilan HP.
2. Solusi **Network Error** saat mencoba login dari HP (`npm run dev -- --host`).
3. Cara pakai **Postman Collection** (dipisah per fungsi & role).

---

## 1. Konten Tenggelam di Balik Navbar (Mobile)

### Penyebab
Layout mobile sebelumnya mengunci `.page` dengan `height: 100vh` + `overflow: hidden`
dan memberi `.content` scroll sendiri (`overflow-y: auto`). Di browser HP, `100vh`
ikut menghitung area di belakang address bar, sehingga kotak konten ter-clip dan
bagian atasnya terlihat seperti tertimpa navbar.

### Perbaikan (file `react-wisata/src/pages/dashboard.css`)
Model layout mobile diganti menjadi **scroll dokumen natural + navbar sticky**:

- `html, body, #root` di-set `height: auto` saat mobile, sehingga yang men-scroll
  adalah **window** (bukan kotak ber-overflow yang bikin `sticky` salah hitung).
- Navbar memakai `position: sticky; top: 0` -> tetap terlihat saat scroll, **tetapi**
  tetap menempati ruang di alur normal, sehingga konten otomatis mulai **di bawah**
  navbar dan tidak pernah tertimpa.
- `.content` mengalir natural (tidak ada `height` paksa / `overflow: hidden`).

Berlaku untuk **wisatawan dan admin** karena keduanya memakai `DashboardLayout`
dengan CSS yang sama.

---

## 2. Network Error saat Login dari HP

### Gejala
Menjalankan `npm run dev -- --host`, lalu membuka alamat IP yang muncul
(mis. `http://192.168.1.10:5173`) di HP yang terhubung WiFi yang sama.
Halaman tampil, tetapi saat **login** muncul **Network Error**.

### Apakah karena MySQL?
**Bukan.** HP tidak pernah terhubung langsung ke MySQL. Yang mengakses MySQL adalah
**backend (Node.js)** yang jalan di laptop. HP hanya bicara ke backend lewat HTTP.

### Akar masalah sebenarnya
Frontend memanggil API memakai nilai `VITE_API_BASE_URL`. Kalau nilainya masih:

```
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

maka di HP, kata **`localhost` menunjuk ke HP itu sendiri**, bukan ke laptop.
Akibatnya request ke `http://localhost:5000` di HP tidak menemukan server apa pun
-> **Network Error**.

### Solusi: pakai IP LAN laptop (bukan localhost)

#### Langkah 1 - Cari IP LAN laptop
- Windows: buka CMD lalu jalankan `ipconfig`, lihat **IPv4 Address**
  (biasanya `192.168.x.x`).
- macOS/Linux: jalankan `ifconfig` atau `ip addr`.

Misal IP laptop = `192.168.1.10`.

#### Langkah 2 - Set `VITE_API_BASE_URL` ke IP laptop
Di `react-wisata/.env`:

```
# Untuk tes dari HP (ganti IP sesuai laptop kamu):
VITE_API_BASE_URL=http://192.168.1.10:5000/api/v1
```

> Setelah ubah `.env`, **restart** `npm run dev -- --host` (Vite hanya baca `.env`
> saat start).

#### Langkah 3 - Jalankan backend agar bisa diakses dari jaringan
Backend (Express) sudah `app.listen(PORT)` yang otomatis mendengar di semua
interface (`0.0.0.0`), jadi cukup pastikan backend berjalan:

```
cd backend
npm run dev
```

Pastikan backend di port **5000**.

#### Langkah 4 - CORS sudah diizinkan untuk LAN (saat development)
File `backend/src/config/cors.js` sudah diperbarui: saat `NODE_ENV !== production`,
origin dari IP privat (`192.168.x.x`, `10.x.x.x`, `172.16-31.x.x`) **otomatis
diizinkan**. Jadi origin `http://192.168.1.10:5173` dari HP tidak akan diblok CORS.
Postman/curl (tanpa origin) juga diizinkan.

#### Langkah 5 - Firewall laptop
Kalau masih gagal, kemungkinan **firewall** memblokir port. Izinkan koneksi masuk
ke port **5000** (backend) dan **5173** (Vite). Di Windows, saat pertama kali
`node`/`vite` jalan biasanya muncul prompt "Allow access" -> pilih **Allow**.

#### Checklist cepat
- [ ] HP & laptop di WiFi yang sama
- [ ] `VITE_API_BASE_URL` memakai IP laptop, bukan `localhost`
- [ ] `npm run dev -- --host` di-restart setelah ubah `.env`
- [ ] Backend jalan di port 5000
- [ ] Firewall mengizinkan port 5000 & 5173
- [ ] Tes buka `http://<IP-laptop>:5000/` di browser HP -> harus muncul JSON
      "Server Backend SPK Wisata Berjalan Normal!"

### Alternatif (tanpa atur IP/CORS): pakai tunnel
Kalau repot dengan IP/firewall, bisa pakai tunnel publik (mis. `ngrok` atau
`vite --host` + layanan tunnel), lalu set `VITE_API_BASE_URL` ke URL tunnel backend.
Cara IP LAN di atas tetap yang paling sederhana untuk satu WiFi.

---

## 3. Postman Collection

File: `postman/SPK-Wisata.postman_collection.json`

Diimpor ke Postman lalu request sudah dikelompokkan **per role & fungsi**:

- **Auth (Publik)** - Register, Login Admin, Login Wisatawan
- **Auth (Login dulu)** - Update Profile, Logout
- **Wisatawan** - List Wisata, Detail Wisata, Hitung Rekomendasi, Riwayat Saya
- **Admin - Kriteria** - Create / Update / Delete
- **Admin - Sub Kriteria** - Create / Update / Delete
- **Admin - Alternatif Wisata** - List / Detail / Create / Update / Delete
- **Admin - Laporan** - Riwayat Global
- **Umum** - Health Check, Dashboard Kriteria/SubKriteria

### Variabel collection
- `base_url` -> default `http://localhost:5000/api/v1`
  (ganti ke `http://<IP-laptop>:5000/api/v1` kalau tes dari device lain)
- `admin_token` -> terisi otomatis setelah "Login Admin"
- `wisatawan_token` -> terisi otomatis setelah "Login Wisatawan"

Request **Login Admin** dan **Login Wisatawan** punya test-script yang otomatis
menyimpan `auth.token` ke variabel token yang sesuai, jadi request lain tinggal
dijalankan tanpa copy-paste token manual.

### Urutan tes yang disarankan
1. **Login Admin** -> token admin tersimpan.
2. Jalankan request di folder **Admin** (kelola kriteria, sub kriteria, wisata).
3. **Register** lalu **Login Wisatawan** -> token wisatawan tersimpan.
4. Jalankan **Hitung Rekomendasi** (kirim `userLocation` lat/long) lalu **Riwayat Saya**.

> Catatan: Create/Update Alternatif Wisata mendukung upload gambar (form-data,
> field `gambar`). Di Postman pilih body **form-data** dan set tipe field `gambar`
> menjadi **File** bila ingin menyertakan gambar.
