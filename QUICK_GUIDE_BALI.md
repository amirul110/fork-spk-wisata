# Panduan Singkat: Update Bali + Upload Fix + Responsive

## 🎯 Apa yang Berubah?

### 1. ✈️ Data Wisata: Magetan → Bali
- 20 destinasi wisata populer di Bali
- Tanah Lot, Uluwatu, Ubud, Kuta, GWK, dll
- Harga tiket: Rp 0 - Rp 125.000

### 2. 📸 Upload Gambar: Semua Format Diterima
- ✅ JPEG, JPG, PNG, GIF
- ✅ WEBP, BMP, SVG, TIFF
- ✅ HEIC/HEIF (iPhone)
- ✅ JFIF (WhatsApp)
- 📏 Max size: 5MB → 10MB

### 3. 📱 Responsive: Optimal untuk HP
- Sidebar sticky di atas
- Dialog full-screen di HP
- Button touch-friendly (44px)
- Table scroll horizontal
- Font auto-adjust

---

## 🚀 Cara Update Cepat

```bash
# 1. Pull changes
git pull origin copilot/add-wisata-input-fields

# 2. Update database
cd backend
npm run seed

# 3. Restart server
npm run dev
```

---

## 📝 Testing Checklist

### Upload Gambar
- [ ] Upload foto dari iPhone (HEIC)
- [ ] Upload foto dari Android (JPEG)
- [ ] Upload screenshot (PNG)
- [ ] Upload gambar dari WhatsApp
- [ ] File besar (8-10MB) tetap bisa

### Responsive Design
- [ ] Buka di HP (portrait mode)
- [ ] Buka di HP (landscape mode)
- [ ] Buka di tablet
- [ ] Sidebar tidak menutupi content
- [ ] Dialog bisa diisi dengan mudah
- [ ] Button cukup besar untuk tap
- [ ] Table bisa scroll kiri-kanan

---

## 🔧 Troubleshooting

### Upload Gagal?
**Cek:**
1. Format file (harus gambar)
2. Ukuran file (max 10MB)
3. Folder `backend/uploads` bisa ditulis?

**Fix:**
```bash
cd backend
chmod 755 uploads
```

### Tidak Responsive di HP?
**Cek:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Coba di browser lain

**Fix:**
```bash
cd react-wisata
rm -rf node_modules/.vite
npm run dev
```

### Data Masih Magetan?
**Fix:**
```bash
cd backend
npm run seed  # Jalankan lagi
```

---

## 📋 Daftar Wisata Bali Baru

| No | Wisata | Harga | Rating |
|----|--------|-------|--------|
| 1 | Tanah Lot | 60rb | 4.6 |
| 2 | Pura Uluwatu | 50rb | 4.7 |
| 3 | Monkey Forest | 80rb | 4.5 |
| 4 | Pantai Kuta | Gratis | 4.4 |
| 5 | Tegallalang | 20rb | 4.3 |
| 6 | Tirta Empul | 50rb | 4.6 |
| 7 | Seminyak | Gratis | 4.5 |
| 8 | Gunung Batur | 100rb | 4.7 |
| 9 | Nusa Penida | 25rb | 4.6 |
| 10 | Campuhan Ridge | Gratis | 4.5 |
| 11 | Pantai Sanur | Gratis | 4.4 |
| 12 | Taman Ayun | 30rb | 4.5 |
| 13 | Tegenungan | 20rb | 4.3 |
| 14 | Pantai Pandawa | 15rb | 4.5 |
| 15 | Pura Besakih | 60rb | 4.4 |
| 16 | Jatiluwih | 40rb | 4.6 |
| 17 | Pantai Jimbaran | Gratis | 4.5 |
| 18 | Pura Batukaru | 30rb | 4.6 |
| 19 | Padang Padang | 15rb | 4.5 |
| 20 | GWK | 125rb | 4.5 |

---

## 💡 Tips

### Upload Gambar
- Compress foto besar dengan tools online jika > 10MB
- Format JPEG lebih kecil dari PNG
- Nama file boleh bahasa Indonesia

### Responsive Design
- Test di HP sebelum deploy
- Gunakan Chrome DevTools untuk simulasi
- Portrait mode lebih kritis dari landscape

### Performa
- Gambar sebaiknya max 1MB untuk loading cepat
- Gunakan WebP untuk size lebih kecil

---

## 📞 Bantuan

### Error Upload
```
Error: "Hanya file gambar yang diperbolehkan"
→ Cek format file, harus gambar
```

### Error Seed
```
Error: "Cannot find module"
→ npm install dulu di folder backend
```

### Responsive Tidak Jalan
```
1. Hard refresh: Ctrl+Shift+R
2. Clear cache
3. Restart dev server
```

---

**Update:** 2026-02-23  
**Status:** ✅ Ready  
**Docs lengkap:** PERUBAHAN_BALI_DAN_RESPONSIVE.md
