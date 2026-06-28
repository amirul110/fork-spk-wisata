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

// Bobot DINAMIS dari matriks perbandingan berpasangan AHP (input user)
const hitungBobotAHP = (matrix) => {
  const n = matrix.length

  // 1. Jumlah tiap kolom
  const colSum = new Array(n).fill(0)
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) colSum[j] += Number(matrix[i][j])
  }

  // 2. Normalisasi -> rata-rata baris = bobot prioritas
  const weights = new Array(n).fill(0)
  for (let i = 0; i < n; i++) {
    let rowSum = 0
    for (let j = 0; j < n; j++) rowSum += Number(matrix[i][j]) / colSum[j]
    weights[i] = rowSum / n
  }

  // 3. λmax (rumus manual AHP: Σⱼ jumlah kolom × bobot)
  let lambdaMax = 0
  for (let j = 0; j < n; j++) lambdaMax += colSum[j] * weights[j]

  // 4. CI & CR
  const CI = n > 1 ? (lambdaMax - n) / (n - 1) : 0
  const RI = RI_TABLE[n] || 1.49
  const CR = RI === 0 ? 0 : CI / RI

  return { weights, lambdaMax, CI, CR, konsisten: CR < 0.1 }
}

module.exports = { hitungJarakKm, hitungBobotAHP }