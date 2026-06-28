import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card } from "primereact/card"
import { Button } from "primereact/button"
import { Dropdown } from "primereact/dropdown"
import { Message } from "primereact/message"
import { Tag } from "primereact/tag"
import { Dialog } from "primereact/dialog"
import {
	KRITERIA_AHP,
	PASANGAN_AHP,
	bangunMatriks,
	hitungAHP,
} from "../../utils/ahp"
import { setPreferensi } from "../../store/preferensiStore"

const RI_TABLE = { 1: 0, 2: 0, 3: 0.58, 4: 0.9, 5: 1.12 }

function opsiSaaty(namaA, namaB) {
	return [
		{ label: `${namaA} mutlak lebih penting (9)`, value: 9 },
		{ label: `${namaA} sangat lebih penting (7)`, value: 7 },
		{ label: `${namaA} lebih penting (5)`, value: 5 },
		{ label: `${namaA} sedikit lebih penting (3)`, value: 3 },
		{ label: `Sama penting (1)`, value: 1 },
		{ label: `${namaB} sedikit lebih penting (3)`, value: 1 / 3 },
		{ label: `${namaB} lebih penting (5)`, value: 1 / 5 },
		{ label: `${namaB} sangat lebih penting (7)`, value: 1 / 7 },
		{ label: `${namaB} mutlak lebih penting (9)`, value: 1 / 9 },
	]
}

// Format angka untuk display di matriks: bilangan utuh tetap, pecahan < 1 jadi 1/n
const fmtCell = (v) => {
	if (v === 1) return "1"
	if (v > 1) return String(v)
	const inv = 1 / v
	if (Math.abs(inv - Math.round(inv)) < 1e-6) return `1/${Math.round(inv)}`
	return v.toFixed(4)
}
const fmt = (v, d = 4) =>
	v === null || v === undefined || isNaN(Number(v))
		? "-"
		: Number(v).toFixed(d)

export default function PilihKriteria() {
	const navigate = useNavigate()
	const [nilai, setNilai] = useState(() => PASANGAN_AHP.map(() => 1))
	const [error, setError] = useState("")
	const [showDetail, setShowDetail] = useState(false)

	const ahp = useMemo(() => {
		const matrix = bangunMatriks(nilai, KRITERIA_AHP.length)
		return { matrix, ...hitungAHP(matrix) }
	}, [nilai])

	const konsisten = ahp.CR < 0.1

	// Rincian intermediate (untuk dialog detail AHP)
	const detailAhp = useMemo(() => {
		const n = KRITERIA_AHP.length
		const m = ahp.matrix
		const colSum = Array.from({ length: n }, (_, j) => {
			let s = 0
			for (let i = 0; i < n; i++) s += m[i][j]
			return s
		})
		const normMatrix = Array.from({ length: n }, (_, i) =>
			Array.from({ length: n }, (_, j) => m[i][j] / colSum[j]),
		)
		const RI = RI_TABLE[n] || 1.49
		return { n, colSum, normMatrix, RI }
	}, [ahp])

	const setPasangan = (idx, v) => {
		setNilai((prev) => {
			const next = [...prev]
			next[idx] = v
			return next
		})
	}

	const lanjut = () => {
		setError("")
		if (!konsisten) {
			setError(
				`Perbandingan tidak konsisten (CR = ${ahp.CR.toFixed(4)} ≥ 0.1). Silakan ulangi.`,
			)
			return
		}
		setPreferensi({
			matrix: ahp.matrix,
			weights: ahp.weights,
			cr: Number(ahp.CR.toFixed(4)),
			lambdaMax: Number(ahp.lambdaMax.toFixed(4)),
			ci: Number(ahp.CI.toFixed(4)),
		})
		navigate("/wisatawan/pilih-lokasi")
	}

	const thStyle = {
		border: "1px solid #dee2e6",
		padding: "8px",
		background: "#f1f5f9",
		textAlign: "center",
		fontWeight: 600,
	}
	const tdStyle = {
		border: "1px solid #dee2e6",
		padding: "8px",
		textAlign: "center",
	}

	return (
		<div className="p-3" style={ { maxWidth: 960, margin: "0 auto" } }>
			<h2 className="mb-1">Preferensi Kriteria Anda</h2>
			<p className="text-color-secondary mt-0 mb-3">
				Bandingkan tingkat kepentingan tiap pasang kriteria. Bobot dihitung
				otomatis (AHP) dari pilihan Anda.
			</p>

			{error ? (
				<Message severity="warn" text={error} className="w-full mb-3" />
			) : null}

			<Card title="1. Bandingkan Kriteria (Skala 1–9)" className="mb-3">
				<div className="flex flex-column gap-3">
					{PASANGAN_AHP.map((pair, idx) => {
						const [a, b] = pair
						const namaA = KRITERIA_AHP[a].nama
						const namaB = KRITERIA_AHP[b].nama
						return (
							<div key={idx} className="flex flex-column gap-1">
								<span className="font-medium">
									{namaA}{" "}
									<span className="text-color-secondary">vs</span> {namaB}
								</span>
								<Dropdown
									value={nilai[idx]}
									options={opsiSaaty(namaA, namaB)}
									onChange={(e) => setPasangan(idx, e.value)}
									className="w-full"
								/>
							</div>
						)
					})}
				</div>
			</Card>

			<Card title="2. Bobot Dinamis & Konsistensi" className="mb-3">
				<div className="flex flex-column gap-2 mb-3">
					{KRITERIA_AHP.map((k, i) => {
						const bobot = (ahp.weights?.[i] ?? 0).toFixed(3)
						const persenBar = (ahp.weights?.[i] ?? 0) * 100
						return (
							<div key={k.id} className="flex align-items-center gap-2">
								<span style={ { width: 200 } }>
									{k.nama}{" "}
									<Tag
										value={k.jenis === "benefit" ? "benefit" : "cost"}
										severity={k.jenis === "benefit" ? "success" : "danger"}
									/>
								</span>
								<div
									style={ {
										flex: 1,
										height: 10,
										background: "#e9ecef",
										borderRadius: 6,
										overflow: "hidden",
									} }
								>
									<div
										style={ {
											width: `${persenBar}%`,
											height: "100%",
											background: "#3b82f6",
										} }
									/>
								</div>
								<span style={ { width: 56, textAlign: "right" } }>
									{bobot}
								</span>
							</div>
						)
					})}
				</div>

				<div className="flex align-items-center gap-2 flex-wrap">
					<span>Consistency Ratio (CR):</span>
					<Tag
						value={ahp.CR.toFixed(4)}
						severity={konsisten ? "success" : "danger"}
					/>
					<span className="text-color-secondary">
						{konsisten
							? "Konsisten (CR < 0.1)"
							: "Tidak konsisten — silakan ulangi"}
					</span>
				</div>
			</Card>

			<div className="flex justify-content-between gap-2 flex-wrap">
				<Button
					label="Lihat Detail Perhitungan AHP"
					icon="pi pi-calculator"
					severity="info"
					outlined
					onClick={() => setShowDetail(true)}
				/>
				<Button
					label="Simpan & Lanjut: Aktifkan Lokasi"
					icon="pi pi-arrow-right"
					iconPos="right"
					onClick={lanjut}
					disabled={!konsisten}
				/>
			</div>

			{/* DIALOG DETAIL PERHITUNGAN AHP */}
			<Dialog
				visible={showDetail}
				header="Detail Perhitungan AHP"
				modal
				style={ { width: "95vw", maxWidth: 900 } }
				onHide={() => setShowDetail(false)}
			>
				{/* LANGKAH 1: Matriks Perbandingan */}
				<h3 className="text-lg font-bold text-800 mt-0 mb-2">
					Langkah 1 — Matriks Perbandingan Berpasangan
				</h3>
				<p className="text-600 text-sm mt-0 mb-3">
					Matriks <i>n × n</i> dibangun dari pilihan skala Saaty. Nilai
					diagonal = 1, dan elemen kebalikannya = 1 / nilai.
				</p>
				<table style={ { width: "100%", borderCollapse: "collapse", marginBottom: "1rem" } }>
					<thead>
						<tr>
							<th style={thStyle}></th>
							{KRITERIA_AHP.map((k) => (
								<th key={k.id} style={thStyle}>{k.nama}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{KRITERIA_AHP.map((kRow, i) => (
							<tr key={kRow.id}>
								<td style={ { ...thStyle, textAlign: "left" } }>{kRow.nama}</td>
								{KRITERIA_AHP.map((kCol, j) => (
									<td key={kCol.id} style={tdStyle}>
										{fmtCell(ahp.matrix[i][j])}
									</td>
								))}
							</tr>
						))}
						<tr>
							<td style={ { ...thStyle, textAlign: "right" } }>Σ kolom</td>
							{detailAhp.colSum.map((s, j) => (
								<td key={j} style={ { ...tdStyle, fontWeight: 700 } }>
									{fmt(s, 4)}
								</td>
							))}
						</tr>
					</tbody>
				</table>

				{/* LANGKAH 2: Matriks Ternormalisasi & Bobot */}
				<h3 className="text-lg font-bold text-800 mt-0 mb-2">
					Langkah 2 — Matriks Ternormalisasi & Bobot Prioritas
				</h3>
				<p className="text-600 text-sm mt-0 mb-3">
					Setiap sel dibagi dengan jumlah kolomnya. Bobot prioritas = rata-rata
					tiap baris dari matriks ternormalisasi.
				</p>
				<table style={ { width: "100%", borderCollapse: "collapse", marginBottom: "1rem" } }>
					<thead>
						<tr>
							<th style={thStyle}></th>
							{KRITERIA_AHP.map((k) => (
								<th key={k.id} style={thStyle}>{k.nama}</th>
							))}
							<th style={thStyle}>Bobot</th>
						</tr>
					</thead>
					<tbody>
						{KRITERIA_AHP.map((kRow, i) => (
							<tr key={kRow.id}>
								<td style={ { ...thStyle, textAlign: "left" } }>{kRow.nama}</td>
								{KRITERIA_AHP.map((kCol, j) => (
									<td key={kCol.id} style={tdStyle}>
										{fmt(detailAhp.normMatrix[i][j], 4)}
									</td>
								))}
								<td style={ { ...tdStyle, fontWeight: 700 } }>
									{fmt(ahp.weights[i], 4)}
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{/* LANGKAH 3: λmax */}
				<h3 className="text-lg font-bold text-800 mt-0 mb-2">
					Langkah 3 — Hitung λ max
				</h3>
				<p className="text-600 text-sm mt-0 mb-3">
					Rumus: <b>λ max = Σⱼ (jumlah kolomⱼ × bobotⱼ)</b>
				</p>
				<table style={ { width: "100%", borderCollapse: "collapse", marginBottom: "1rem" } }>
					<thead>
						<tr>
							<th style={thStyle}>Kriteria</th>
							<th style={thStyle}>Σ kolom</th>
							<th style={thStyle}>Bobot</th>
							<th style={thStyle}>Σ kolom × Bobot</th>
						</tr>
					</thead>
					<tbody>
						{KRITERIA_AHP.map((k, j) => (
							<tr key={k.id}>
								<td style={ { ...tdStyle, textAlign: "left" } }>{k.nama}</td>
								<td style={tdStyle}>{fmt(detailAhp.colSum[j], 4)}</td>
								<td style={tdStyle}>{fmt(ahp.weights[j], 4)}</td>
								<td style={tdStyle}>
									{fmt(detailAhp.colSum[j] * ahp.weights[j], 4)}
								</td>
							</tr>
						))}
						<tr>
							<td
								style={ { ...tdStyle, textAlign: "right", fontWeight: 700 } }
								colSpan={3}
							>
								λ max
							</td>
							<td style={ { ...tdStyle, fontWeight: 700 } }>
								{fmt(ahp.lambdaMax, 4)}
							</td>
						</tr>
					</tbody>
				</table>

				{/* LANGKAH 4: CI, RI, CR */}
				<h3 className="text-lg font-bold text-800 mt-0 mb-2">
					Langkah 4 — Konsistensi (CI, RI, CR)
				</h3>
				<p className="text-600 text-sm mt-0 mb-3">
					<b>CI = (λ max − n) / (n − 1)</b> &nbsp;|&nbsp;{" "}
					<b>CR = CI / RI</b>. Konsisten jika <b>CR &lt; 0.1</b>.
				</p>
				<div className="flex flex-wrap gap-2 mb-2">
					<Tag value={`n = ${detailAhp.n}`} severity="info" />
					<Tag value={`λ max = ${fmt(ahp.lambdaMax, 4)}`} severity="info" />
					<Tag value={`CI = ${fmt(ahp.CI, 4)}`} severity="info" />
					<Tag value={`RI = ${fmt(detailAhp.RI, 4)}`} severity="info" />
					<Tag value={`CR = ${fmt(ahp.CR, 4)}`} severity="info" />
					<Tag
						value={konsisten ? "Konsisten (CR < 0.1)" : "Tidak konsisten (CR ≥ 0.1)"}
						severity={konsisten ? "success" : "danger"}
					/>
				</div>
			</Dialog>
		</div>
	)
}