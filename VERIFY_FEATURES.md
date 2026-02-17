# ✅ Verification Guide: AdminAlternatif Features

## Problem: Button Not Showing After Cache Clear

If you've cleared your cache and the button still doesn't show, **you don't have the latest code**.

---

## Step 1: Pull Latest Code

```bash
cd /path/to/spk-wisata
git pull origin copilot/fix-profile-update-errors
```

Expected output:
```
From github.com:Fanboy181826/spk-wisata
 * branch            copilot/fix-profile-update-errors -> FETCH_HEAD
Updating xxxxxxx..1d76260
Fast-forward
 react-wisata/src/pages/admin/AdminAlternatif.jsx | XX insertions(+), XX deletions(-)
```

If you see "Already up to date", you have the latest code.

---

## Step 2: Verify Code Locally

Run this command to check if the button exists in YOUR local file:

```bash
cd react-wisata
grep -n "Tambah Data" src/pages/admin/AdminAlternatif.jsx
```

**Expected output:**
```
279:          <Button label='Tambah Data' icon='pi pi-plus' onClick={openNew} />
314:          header={isEdit ? 'Edit Data Wisata' : 'Tambah Data Wisata'}
```

✅ If you see this, the code is correct!
❌ If you DON'T see this, you need to pull the latest code (Step 1)

---

## Step 3: Restart Dev Server

```bash
cd react-wisata

# Stop server (Ctrl+C if running)

# Clear Vite cache
rm -rf node_modules/.vite

# Restart
npm run dev
```

---

## Step 4: Verify in Browser

1. Open: `http://localhost:5173/admin/alternatif`
2. Open DevTools (F12)
3. Go to Network tab
4. Check "Disable cache"
5. Refresh page (F5)

**You should see:**
- Search box on left
- **"Tambah Data" button with plus icon on right**

---

## If Button Still Not Showing

### Check Browser Console for Errors:
1. Press F12
2. Go to Console tab
3. Look for any red errors
4. Take screenshot and report errors

### Check Network Tab:
1. Press F12
2. Go to Network tab
3. Refresh page
4. Look for the JavaScript file loading
5. Check if `AdminAlternatif.jsx` or bundle is loading

---

## Features That Should Work

### 1. Tambah Data Button
- **Location:** Top right
- **Label:** "Tambah Data"
- **Icon:** Plus icon (➕)

### 2. Dialog After Clicking Button
Should show form with these fields:
- Nama Wisata
- Deskripsi
- **Gambar** (image upload with drag & drop)
- Latitude
- Longitude
- **Rating** (with BLUE sub-kriteria indicator)
- **Harga Tiket** (with GREEN sub-kriteria indicator)
- **Fasilitas** (with PURPLE sub-kriteria indicator showing count)
- Waktu Kunjungan

### 3. Sub-Kriteria Indicators
When you type in the form:
- **Rating 4.7** → Shows "Sub-Kriteria: Sangat Baik (4.5 - 5.0) (Bobot: 5)" in blue
- **Harga 45000** → Shows "Sub-Kriteria: Murah (20rb - 50rb) (Bobot: 2)" in green
- **Fasilitas: Toilet, Parkir, Mushola** → Shows "Jumlah: 3 item | Sub-Kriteria: Cukup (3 item) (Bobot: 3)" in purple

---

## Quick Diagnostic

Run this single command to verify everything:

```bash
cd react-wisata/src/pages/admin
echo "Checking for Tambah Data button..."
grep -q "Tambah Data.*onClick={openNew}" AdminAlternatif.jsx && echo "✅ Button EXISTS" || echo "❌ Button MISSING - Pull latest code!"

echo "Checking for Image Upload..."
grep -q "FileUpload" AdminAlternatif.jsx && echo "✅ Image upload EXISTS" || echo "❌ Image upload MISSING"

echo "Checking for Sub-Kriteria helpers..."
grep -q "getHargaSubKriteria\|getRatingSubKriteria" AdminAlternatif.jsx && echo "✅ Sub-kriteria helpers EXIST" || echo "❌ Sub-kriteria helpers MISSING"
```

---

## Still Having Issues?

### Option 1: Check Git Branch
```bash
git branch
# You should be on: copilot/fix-profile-update-errors
```

If not:
```bash
git checkout copilot/fix-profile-update-errors
git pull origin copilot/fix-profile-update-errors
```

### Option 2: Clean Install
```bash
cd react-wisata
rm -rf node_modules
rm -rf node_modules/.vite
npm install
npm run dev
```

### Option 3: Check File Directly
```bash
cat react-wisata/src/pages/admin/AdminAlternatif.jsx | grep -A 2 -B 2 "Tambah Data"
```

This will show the actual code around the button.

---

## Commit That Added Features

The features were added in commit: **1d76260**

Title: "Add sub-kriteria value indicators to AdminAlternatif form"

To verify you have this commit:
```bash
git log --oneline | grep "1d76260"
```

If you see it, you have the code. If not, you need to pull.

---

**Summary:** The code exists in the repository. If you can't see the button, you haven't pulled the latest code to your local machine. Follow Step 1-4 above.
