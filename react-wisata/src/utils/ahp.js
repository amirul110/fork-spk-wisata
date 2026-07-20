export const KRITERIA_AHP = [
  { id: 1, nama: "Rating Google Maps", jenis: "benefit" },
  { id: 2, nama: "Atraksi Wisata", jenis: "benefit" },
  { id: 3, nama: "Harga Tiket Masuk", jenis: "cost" },
  { id: 4, nama: "Jarak Tempuh", jenis: "cost" },
]

export const PASANGAN_AHP = [
  [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3],
]

// Tabel Random Index
const RI_TABLE = { 1: 0, 2: 0, 3: 0.58, 4: 0.9, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49 }

export function bangunMatriks(nilaiPasangan, n = KRITERIA_AHP.length) {
  const m = Array.from({ length: n }, () => new Array(n).fill(1))
  PASANGAN_AHP.forEach((pair, idx) => {
    const [a, b] = pair
    const v = nilaiPasangan[idx] || 1
    m[a][b] = v
    m[b][a] = 1 / v
  })
  return m
}

// UPDATE: Disamakan dengan Backend (Metode Eigenvector Power Iteration)
export function hitungAHP(matrix) {
  const n = matrix.length
  
  // 1. Jumlah tiap kolom
  const colSum = new Array(n).fill(0)
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) colSum[j] += matrix[i][j]
      
  // 2. Eigen Vektor (Nilai Baris / n)
  const weights = new Array(n).fill(0)
  for (let i = 0; i < n; i++) {
    let rowSum = 0
    for (let j = 0; j < n; j++) rowSum += matrix[i][j] / colSum[j]
    weights[i] = rowSum / n
  }

  // 3. Lambda Max
  let lambdaMax = 0
  for (let j = 0; j < n; j++) lambdaMax += colSum[j] * weights[j]

  // 4. CI & CR
  const CI = n > 1 ? (lambdaMax - n) / (n - 1) : 0
  const RI = RI_TABLE[n] || 1.49
  const CR = RI === 0 ? 0 : CI / RI


  return { weights, lambdaMax, CI, CR, konsisten: CR < 0.1 }
}