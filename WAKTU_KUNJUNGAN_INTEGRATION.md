# Waktu Kunjungan Sub-Kriteria Integration

## Ringkasan Perubahan

Dokumen ini menjelaskan implementasi integrasi sub-kriteria waktu kunjungan pada halaman AdminSubKriteria dan AdminAlternatif.

## Perubahan yang Dilakukan

### 1. AdminSubKriteria - Format Input Waktu 24 Jam

**File**: `react-wisata/src/pages/admin/AdminSubKriteria.jsx`

**Perubahan**:
- Added placeholder untuk field `batas_bawah`: "Contoh: 8.00 atau 17.00"
- Added placeholder untuk field `batas_atas`: "Contoh: 12.00 atau 22.00"
- Added help text untuk kedua field: "Format: gunakan format 24 jam dalam desimal (misal: 8.00, 17.30)"

**Manfaat**:
- Admin mendapat panduan jelas tentang format input waktu
- Konsisten dengan format 24 jam yang digunakan di sistem
- Menggunakan desimal untuk memudahkan parsing (8.00 = 8 jam, 17.30 = 17.5 jam)

**Contoh Input**:
- Pagi: batas_bawah = 8.00, batas_atas = 12.00
- Siang: batas_bawah = 12.10, batas_atas = 15.00  
- Sore: batas_bawah = 15.10, batas_atas = 18.00
- Malam: batas_bawah = 18.10, batas_atas = 22.00
- 24 Jam: batas_bawah = 0, batas_atas = 24

---

### 2. AdminAlternatif - Integrasi Sub-Kriteria Waktu Kunjungan

**File**: `react-wisata/src/pages/admin/AdminAlternatif.jsx`

#### A. Import Service
```javascript
import { getSubKriteriaByKriteria } from '../../services/subkriteria.service'
```

#### B. State Management
- Added state: `waktuKunjunganSubKriteria` untuk menyimpan data sub-kriteria waktu kunjungan
- Fetch data saat component mount dengan `fetchWaktuKunjunganSubKriteria()` yang mengambil data dari kriteria ID 5 (Waktu Kunjungan)

#### C. Helper Function: `getWaktuKunjunganSubKriteria()`

Fungsi ini melakukan:

1. **Parse Input Waktu**:
   - Mendukung format: "08.00 - 17.00", "8:00 - 17:00", "8.30 - 12.00"
   - Regex pattern: `/(\d{1,2})[\.:h](\d{0,2})\s*-\s*(\d{1,2})[\.:h](\d{0,2})/`

2. **Handle Special Cases**:
   - Deteksi string seperti: "24 jam", "24 Jam", "Bebas", "Setiap hari"
   - Cocokkan dengan sub-kriteria yang memiliki batas 0-24

3. **Matching Logic**:
   - Convert waktu ke desimal (misal: 8.00 = 8, 17.30 = 17.5)
   - Cek apakah waktu mulai masuk dalam range batas_bawah dan batas_atas sub-kriteria
   - Return: `{ category, bobot, match }`

**Contoh Matching**:
```
Input: "08.00 - 17.00"
→ startHour = 8.0
→ Cocok dengan "Pagi (08:00 - 12:00)" (batas 8-12)
→ Return: { category: "Pagi (08:00 - 12:00)", bobot: 5, match: 'time' }

Input: "24 jam"
→ Cocok dengan "Bebas / 24 Jam" (batas 0-24)
→ Return: { category: "Bebas / 24 Jam", bobot: 1, match: 'special' }
```

#### D. Real-time Indicator di Form

Ditambahkan indikator real-time di bawah field "Waktu Kunjungan":

```jsx
{form.waktu_kunjungan && form.waktu_kunjungan.trim() && (
  <div className='mt-2 p-2 bg-orange-50 border-round'>
    <small className='text-600'>
      <strong>Sub-Kriteria:</strong> {getWaktuKunjunganSubKriteria(form.waktu_kunjungan).category} 
      {' '}<span className='text-orange-600'>(Bobot: {getWaktuKunjunganSubKriteria(form.waktu_kunjungan).bobot})</span>
    </small>
  </div>
)}
```

**Warna**: Orange (bg-orange-50, text-orange-600) untuk membedakan dari kriteria lain:
- Rating: Blue
- Harga: Green
- Fasilitas: Purple
- **Waktu Kunjungan: Orange** ✨

#### E. Detail Sub Kriteria Dialog

Ditambahkan section "Waktu Kunjungan" di dialog "Detail Sub Kriteria" (tombol oranye):

**Struktur**:
```jsx
{/* Waktu Kunjungan Sub-Kriteria */}
<div className='surface-50 border-round p-3'>
  <h4 className='text-lg font-bold text-orange-700'>Waktu Kunjungan</h4>
  <div className='grid'>
    - Waktu Kunjungan: {selectedWisataForFacility.waktu_kunjungan}
    - Kategori Sub-Kriteria: {waktuKunjunganClassification.category}
    - Nilai Bobot: {waktuKunjunganClassification.bobot}
    - Keterangan: "Berdasarkan kriteria waktu kunjungan..."
  </div>
</div>
```

**Posisi**: Setelah section Fasilitas, di bagian paling bawah dialog

**Kriteria yang Ditampilkan** (Total 4):
1. 🔵 Rating Google Maps (Blue)
2. 🟢 Harga Tiket (Green)
3. 🟣 Fasilitas (Purple)
4. 🟠 **Waktu Kunjungan (Orange)** ← NEW!

---

## Kategori Sub-Kriteria Waktu Kunjungan

Berdasarkan seed data di `backend/src/database/seeds/04_sub_kriteria_seed.js`:

| ID | Nama Sub-Kriteria | Range Waktu | Bobot | Batas Bawah | Batas Atas |
|----|-------------------|-------------|-------|-------------|------------|
| 21 | Pagi (08:00 - 12:00) | 08:00 - 12:00 | 5 | 8.0 | 12.0 |
| 22 | Siang (12:00 - 15:00) | 12:00 - 15:00 | 4 | 12.1 | 15.0 |
| 23 | Sore (15:00 - 18:00) | 15:00 - 18:00 | 3 | 15.1 | 18.0 |
| 24 | Malam (18:00 - 22:00) | 18:00 - 22:00 | 2 | 18.1 | 22.0 |
| 25 | Bebas / 24 Jam | 24 Jam | 1 | 0 | 24.0 |

**Catatan**: 
- Bobot tertinggi (5) = Pagi karena lebih baik untuk wisata
- Bobot terendah (1) = 24 Jam karena tidak ada pembatasan khusus

---

## Cara Menggunakan

### Admin Sub-Kriteria (`/admin/sub-kriteria`)

1. Pilih kriteria "Waktu Kunjungan" dari dropdown
2. Klik "Tambah Data" untuk menambah sub-kriteria baru
3. Isi field:
   - **Nama Sub Kriteria**: Misal "Pagi (08:00 - 12:00)"
   - **Nilai Bobot**: 1-5
   - **Batas Bawah**: 8.00 (format desimal 24 jam)
   - **Batas Atas**: 12.00 (format desimal 24 jam)
4. Klik "Simpan"

### Admin Alternatif (`/admin/alternatif`)

#### Tambah/Edit Wisata:
1. Klik "Tambah Data" atau edit wisata yang ada
2. Isi field "Waktu Kunjungan" dengan salah satu format:
   - Format waktu: `08.00 - 17.00`, `8:00 - 17:00`, `17.30 - 22.00`
   - String bebas: `24 jam`, `Bebas`, `Setiap hari`
3. Lihat indikator real-time di bawah field yang menampilkan:
   - Kategori sub-kriteria yang cocok
   - Nilai bobot

#### Lihat Detail Sub Kriteria:
1. Klik tombol **oranye** (icon chart-bar) pada baris wisata
2. Dialog akan menampilkan 4 kriteria:
   - Rating Google Maps
   - Harga Tiket
   - Fasilitas
   - **Waktu Kunjungan** ← NEW!

---

## Contoh Penggunaan

### Contoh 1: Wisata dengan Jam Operasional Normal
```
Input: "08.00 - 17.00"
Hasil: 
- Sub-Kriteria: "Pagi (08:00 - 12:00)"
- Bobot: 5
- Match: 'time'
```

### Contoh 2: Wisata Malam
```
Input: "18.00 - 22.00"
Hasil:
- Sub-Kriteria: "Malam (18:00 - 22:00)"
- Bobot: 2
- Match: 'time'
```

### Contoh 3: Wisata 24 Jam
```
Input: "24 jam"
Hasil:
- Sub-Kriteria: "Bebas / 24 Jam"
- Bobot: 1
- Match: 'special'
```

### Contoh 4: Format Tidak Dikenali
```
Input: "pagi sampai sore"
Hasil:
- Sub-Kriteria: "Format tidak dikenali"
- Bobot: 0
- Match: null
```

---

## Files Modified

1. **react-wisata/src/pages/admin/AdminSubKriteria.jsx**
   - Added placeholders and help text for time format

2. **react-wisata/src/pages/admin/AdminAlternatif.jsx**
   - Added import for `getSubKriteriaByKriteria`
   - Added state for `waktuKunjunganSubKriteria`
   - Added `fetchWaktuKunjunganSubKriteria()` function
   - Added `getWaktuKunjunganSubKriteria()` helper function
   - Added real-time indicator for waktu kunjungan field
   - Added waktu kunjungan section to detail dialog

---

## Technical Notes

- **Backward Compatible**: Ya, tidak ada breaking changes
- **Database Changes**: Tidak ada perubahan schema
- **API Changes**: Tidak ada perubahan endpoint
- **Format Parsing**: Mendukung berbagai format waktu (., :, h sebagai separator)
- **Error Handling**: Mengembalikan default values jika format tidak valid

---

## Testing Checklist

### AdminSubKriteria
- [ ] Buka `/admin/sub-kriteria`
- [ ] Pilih kriteria "Waktu Kunjungan"
- [ ] Klik "Tambah Data"
- [ ] Verifikasi placeholder dan help text muncul di field batas_bawah dan batas_atas
- [ ] Input nilai contoh: 8.00 dan 12.00
- [ ] Simpan dan verifikasi data tersimpan

### AdminAlternatif - Form Input
- [ ] Buka `/admin/alternatif`
- [ ] Klik "Tambah Data"
- [ ] Input waktu kunjungan: "08.00 - 17.00"
- [ ] Verifikasi indikator orange muncul dengan kategori "Pagi (08:00 - 12:00)" dan bobot 5
- [ ] Input waktu kunjungan: "24 jam"
- [ ] Verifikasi indikator orange muncul dengan kategori "Bebas / 24 Jam" dan bobot 1
- [ ] Input waktu kunjungan: "18.00 - 22.00"
- [ ] Verifikasi indikator orange muncul dengan kategori "Malam (18:00 - 22:00)" dan bobot 2

### AdminAlternatif - Detail Dialog
- [ ] Buka `/admin/alternatif`
- [ ] Klik tombol oranye (chart-bar) pada salah satu wisata
- [ ] Verifikasi dialog menampilkan 4 section:
  - Rating Google Maps (Blue)
  - Harga Tiket (Green)
  - Fasilitas (Purple)
  - Waktu Kunjungan (Orange)
- [ ] Verifikasi section Waktu Kunjungan menampilkan:
  - Waktu kunjungan dari data wisata
  - Kategori sub-kriteria yang cocok
  - Nilai bobot
  - Keterangan lengkap

---

## Troubleshooting

**Q: Indikator tidak muncul saat input waktu kunjungan?**
A: Pastikan format input benar (misal: "08.00 - 17.00" atau "24 jam"). Jika format salah, akan muncul "Format tidak dikenali" dengan bobot 0.

**Q: Sub-kriteria tidak cocok dengan yang diharapkan?**
A: Cek data sub-kriteria di `/admin/sub-kriteria` untuk memastikan range batas_bawah dan batas_atas sudah benar.

**Q: Dialog tidak menampilkan section waktu kunjungan?**
A: Clear browser cache (Ctrl+Shift+R) dan restart dev server.

---

**Status**: ✅ Complete and Ready for Testing
