// Hitung jarak dua titik (km) dengan rumus Haversine
const hitungJarakKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Random Index (Saaty) untuk Consistency Ratio
const RI_TABLE = {
  1: 0,
  2: 0,
  3: 0.58,
  4: 0.9,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
}

/**
 * Hitung bobot AHP dengan metode EIGENVECTOR POWER ITERATION (Saaty asli).
 *
 * Metode ini mencari eigenvector utama dari matriks perbandingan berpasangan
 * lewat iterasi berulang:
 *   w_{k+1} = A × w_k, lalu dinormalisasi supaya Σw = 1
 * Iterasi berhenti saat selisih antar iterasi < 1e-12 (atau maksimal 200 iterasi).
 *
 * Berbeda dengan metode "rata-rata kolom ternormalisasi" yang biasa dipakai
 * untuk perhitungan manual (tangan), metode ini menghasilkan bobot yang
 * sedikit lebih presisi secara matematis. Perbedaan tipis (< 1%) berguna
 * untuk pengujian akurasi sistem menggunakan MAPE.
 */
const hitungBobotAHP = (matrix) => {
  const n = matrix.length
  const MAX_ITER = 200
  const TOLERANCE = 1e-12

  // Konversi matriks input ke Number
  const A = matrix.map((row) => row.map(Number))

  // 1. Jumlah tiap kolom (dipakai nanti untuk hitung λmax formula Saaty)
  const colSum = new Array(n).fill(0)
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) colSum[j] += A[i][j]
  }

  // 2. Inisialisasi vektor bobot dengan nilai seragam
  let w = new Array(n).fill(1 / n)

  // 3. Power iteration: w_{k+1} = A × w_k, lalu normalisasi
  for (let iter = 0; iter < MAX_ITER; iter++) {
    const wNext = new Array(n).fill(0)
    for (let i = 0; i < n; i++) {
      let sum = 0
      for (let j = 0; j < n; j++) sum += A[i][j] * w[j]
      wNext[i] = sum
    }
    // Normalisasi agar Σw = 1
    const total = wNext.reduce((s, v) => s + v, 0)
    for (let i = 0; i < n; i++) wNext[i] /= total

    // Cek konvergensi
    let maxDiff = 0
    for (let i = 0; i < n; i++) {
      const d = Math.abs(wNext[i] - w[i])
      if (d > maxDiff) maxDiff = d
    }
    w = wNext
    if (maxDiff < TOLERANCE) break
  }

  const weights = w

  // 4. λmax (rumus praktis Saaty: Σⱼ jumlah kolom × bobot)
  let lambdaMax = 0
  for (let j = 0; j < n; j++) lambdaMax += colSum[j] * weights[j]

  // 5. CI & CR
  const CI = n > 1 ? (lambdaMax - n) / (n - 1) : 0
  const RI = RI_TABLE[n] || 1.49
  const CR = RI === 0 ? 0 : CI / RI

  return { weights, lambdaMax, CI, CR, konsisten: CR < 0.1 }
}

module.exports = { hitungJarakKm, hitungBobotAHP }