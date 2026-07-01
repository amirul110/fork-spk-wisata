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

// Skala Saaty 1–9 LENGKAP dengan nilai antara (2,4,6,8) & kebalikannya
function opsiSaaty(namaA, namaB) {
	return [
		{ label: `${namaA} mutlak lebih penting (9)`, value: 9 },
		{ label: `${namaA} antara mutlak & sangat (8)`, value: 8 },
		{ label: `${namaA} sangat lebih penting (7)`, value: 7 },
		{ label: `${namaA} antara sangat & lebih (6)`, value: 6 },
		{ label: `${namaA} lebih penting (5)`, value: 5 },
		{ label: `${namaA} antara lebih & sedikit (4)`, value: 4 },
		{ label: `${namaA} sedikit lebih penting (3)`, value: 3 },
		{ label: `${namaA} antara sedikit & sama (2)`, value: 2 },
		{ label: `Sama penting (1)`, value: 1 },
		{ label: `${namaB} antara sedikit & sama (1/2)`, value: 1 / 2 },
		{ label: `${namaB} sedikit lebih penting (1/3)`, value: 1 / 3 },
		{ label: `${namaB} antara lebih & sedikit (1/4)`, value: 1 / 4 },
		{ label: `${namaB} lebih penting (1/5)`, value: 1 / 5 },
		{ label: `${namaB} antara sangat & lebih (1/6)`, value: 1 / 6 },
		{ label: `${namaB} sangat lebih penting (1/7)`, value: 1 / 7 },
		{ label: `${namaB} antara mutlak & sangat (1/8)`, value: 1 / 8 },
		{ label: `${namaB} mutlak lebih penting (1/9)`, value: 1 / 9 },
	]
}

// Tampilkan pecahan rapi: 1, 1/3, 1/9, dll
const fmtCell = (v) => {
	if (v === 1) return "1"
	if (v > 1) return String(v)
	const inv = 1 / v
	if (Math.abs(inv - Math.round(inv)) < 1e-6) return `1/${Math.round(inv)}`
	return v.toFixed(3)
}
const fmt = (v, d = 3) =>
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

	// Rincian intermediate untuk dialog detail
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
		// Nilai baris (Σ baris dari matriks ternormalisasi)
		const rowSums = normMatrix.map((row) =>
			row.reduce((a, b) => a + b, 0),
		)
		// Eigen vektor = nilai baris / n (= bobot prioritas)
		const eigen = rowSums.map((r) => r / n)
		const RI = RI_TABLE[n] || 1.49
		return { n, colSum, normMatrix, rowSums, eigen, RI }
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

			{/* DIALOG: DETAIL PERHITUNGAN AHP (6 LANGKAH) */}
			<Dialog
				visible={showDetail}
				header="Detail Perhitungan AHP"
				modal
				style={ { width: "95vw", maxWidth: 950 } }
				onHide={() => setShowDetail(false)}
			>
				{/* LANGKAH 1 */}
				<h3 className="text-lg font-bold text-800 mt-0 mb-2">
					Langkah 1 — Membuat Matriks Perbandingan Berpasangan
				</h3>
				<p className="text-600 text-sm mt-0 mb-3">
					Diagonal = 1, kebalikannya = 1 / nilai input.
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
									{fmt(s, 3)}
								</td>
							))}
						</tr>
					</tbody>
				</table>

				{/* LANGKAH 2 */}
				<h3 className="text-lg font-bold text-800 mt-0 mb-2">
					Langkah 2 — Matriks Perbandingan (3 desimal)
				</h3>
				<p className="text-600 text-sm mt-0 mb-3">
					Versi desimal dari matriks di atas.
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
										{fmt(ahp.matrix[i][j], 3)}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>

				{/* LANGKAH 3 */}
				<h3 className="text-lg font-bold text-800 mt-0 mb-2">
					Langkah 3 — Matriks Ternormalisasi (Bobot Relatif yang Dinormalkan)
				</h3>
				<p className="text-600 text-sm mt-0 mb-3">
					Setiap sel = nilai sel / Σ kolomnya.
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
										{fmt(detailAhp.normMatrix[i][j], 3)}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>

				{/* LANGKAH 4 & 5 */}
		{/* LANGKAH 4 — NILAI BARIS */}
{/* LANGKAH 4 — NILAI BARIS (penjabaran penjumlahan) */}
<h3 className="text-lg font-bold text-800 mt-0 mb-2">
	Langkah 4 — Nilai Baris
</h3>
<p className="text-600 text-sm mt-0 mb-3">
	<b>Nilai Barisᵢ = Σⱼ (Matriks Ternormalisasiᵢⱼ)</b>{" "}
	— jumlahkan seluruh sel pada baris ke-i dari Matriks Ternormalisasi
	(Langkah 3).
</p>

<div
	style={ {
		fontSize: "1.05rem",
		lineHeight: 2,
		padding: "16px 20px",
		background: "#f8fafc",
		borderRadius: 8,
		border: "1px solid #e2e8f0",
		marginBottom: "1rem",
	} }
>
	{KRITERIA_AHP.map((kRow, i) => (
		<div key={kRow.id} className="mb-2">
			<b>{kRow.nama}</b> ={" "}
			{detailAhp.normMatrix[i]
				.map((v) => fmt(v, 3))
				.join(" + ")}{" "}
			={" "}
			<b style={ { color: "#1d4ed8" } }>
				{fmt(detailAhp.rowSums[i], 3)}
			</b>
		</div>
	))}
</div>
{/* LANGKAH 5 — EIGEN VEKTOR */}
<h3 className="text-lg font-bold text-800 mt-0 mb-2">
	Langkah 5 — Eigen Vektor (Bobot Prioritas)
</h3>
<p className="text-600 text-sm mt-0 mb-3">
	<b>Eigen Vektorᵢ = Nilai Barisᵢ ÷ n</b> (di mana n = jumlah kriteria
	= {detailAhp.n}).
</p>
<table style={ { width: "100%", borderCollapse: "collapse", marginBottom: "1rem" } }>
	<thead>
		<tr>
			<th style={thStyle}>Kriteria</th>
			<th style={thStyle}>Nilai Baris</th>
			<th style={thStyle}>÷ n</th>
			<th style={thStyle}>Perhitungan</th>
			<th style={thStyle}>Eigen Vektor</th>
		</tr>
	</thead>
	<tbody>
		{KRITERIA_AHP.map((k, i) => (
			<tr key={k.id}>
				<td style={ { ...tdStyle, textAlign: "left" } }>{k.nama}</td>
				<td style={tdStyle}>{fmt(detailAhp.rowSums[i], 3)}</td>
				<td style={tdStyle}>{detailAhp.n}</td>
				<td style={tdStyle}>
					{fmt(detailAhp.rowSums[i], 3)} ÷ {detailAhp.n}
				</td>
				<td style={ { ...tdStyle, fontWeight: 700 } }>
					{fmt(detailAhp.eigen[i], 3)}
				</td>
			</tr>
		))}
	</tbody>
</table>

				{/* LANGKAH 6: λmax */}
				<h3 className="text-lg font-bold text-800 mt-0 mb-2">
					Langkah 6 — Nilai Maksimum (λ max)
				</h3>
				<p className="text-600 text-sm mt-0 mb-3">
					<b>λ max = Σⱼ (Σ kolomⱼ × bobotⱼ)</b>
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
								<td style={tdStyle}>{fmt(detailAhp.colSum[j], 3)}</td>
								<td style={tdStyle}>{fmt(ahp.weights[j], 3)}</td>
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

				{/* CI, RI, CR */}
			{/* LANGKAH 7 — KONSISTENSI: CI, RI, CR */}
<h3 className="text-lg font-bold text-800 mt-0 mb-2">
	Langkah 7 — Konsistensi: CI, RI, CR
</h3>
<p className="text-600 text-sm mt-0 mb-3">
	<b>CI = (λ max − n) / (n − 1)</b> &nbsp;|&nbsp;{" "}
	<b>CR = CI / RI</b>. Perbandingan dinyatakan konsisten jika{" "}
	<b>CR &lt; 0.1</b>.
</p>

<div
	style={ {
		fontSize: "1.05rem",
		lineHeight: 2,
		padding: "16px 20px",
		background: "#f8fafc",
		borderRadius: 8,
		border: "1px solid #e2e8f0",
		marginBottom: "0.75rem",
	} }
>
	<div className="mb-2">
		<b>n</b> = {detailAhp.n} &nbsp;&nbsp;|&nbsp;&nbsp;{" "}
		<b>λ max</b> = {fmt(ahp.lambdaMax, 4)} &nbsp;&nbsp;|&nbsp;&nbsp;{" "}
		<b>RI</b> (n = {detailAhp.n}) = {fmt(detailAhp.RI, 2)}
	</div>

	<div className="mb-2">
		<b>CI</b> = (λ max − n) / (n − 1) ={" "}
		<b>({fmt(ahp.lambdaMax, 4)} − {detailAhp.n})</b> /{" "}
		<b>({detailAhp.n} − 1)</b> ={" "}
		<b>{fmt(ahp.lambdaMax - detailAhp.n, 4)} / {detailAhp.n - 1}</b>{" "}
		= <b style={ { color: "#1d4ed8" } }>{fmt(ahp.CI, 4)}</b>
	</div>

	<div className="mb-2">
		<b>CR</b> = CI / RI ={" "}
		<b>{fmt(ahp.CI, 4)} / {fmt(detailAhp.RI, 2)}</b> ={" "}
		<b style={ { color: "#1d4ed8" } }>{fmt(ahp.CR, 4)}</b>
	</div>

	<div>
		Karena <b>CR = {fmt(ahp.CR, 4)} {konsisten ? "<" : "≥"} 0.1</b>,
		maka perbandingan kriteria dinyatakan{" "}
		<b
			style={ { color: konsisten ? "#15803d" : "#b91c1c" } }
		>
			{konsisten ? "KONSISTEN" : "TIDAK KONSISTEN"}
		</b>
		.
	</div>
</div>
				{/* LANGKAH 7: BOBOT YANG DIPEROLEH */}
<h3 className="text-lg font-bold text-800 mt-4 mb-2">
	Langkah 8 — Bobot Akhir yang Diperoleh
</h3>
<p className="text-600 text-sm mt-0 mb-3">
	Bobot tiap kriteria diambil <b>langsung dari nilai Eigen Vektor</b>{" "}
	(Langkah 5), karena eigen vektor sudah ternormalisasi sehingga total
	seluruh bobot = 1 (100%).
	<br />
	<b>
		Wⱼ = Eigen Vektorⱼ = (Nilai Barisⱼ ÷ n) ; dengan Σ Wⱼ = 1
	</b>
</p>
<table style={ { width: "100%", borderCollapse: "collapse", marginBottom: "0.5rem" } }>
	<thead>
		<tr>
			<th style={thStyle}>Kriteria</th>
			<th style={thStyle}>Nilai Baris</th>
			<th style={thStyle}>Eigen Vektor (÷ n)</th>
			<th style={thStyle}>Bobot (Wⱼ)</th>
			<th style={thStyle}>Persentase</th>
		</tr>
	</thead>
	<tbody>
		{KRITERIA_AHP.map((k, i) => (
			<tr key={k.id}>
				<td style={ { ...tdStyle, textAlign: "left" } }>
					{k.nama}{" "}
					<Tag
						value={k.jenis === "benefit" ? "benefit" : "cost"}
						severity={k.jenis === "benefit" ? "success" : "danger"}
					/>
				</td>
				<td style={tdStyle}>{fmt(detailAhp.rowSums[i], 3)}</td>
				<td style={tdStyle}>
					{fmt(detailAhp.rowSums[i], 3)} ÷ {detailAhp.n} ={" "}
					{fmt(detailAhp.eigen[i], 3)}
				</td>
				<td style={ { ...tdStyle, fontWeight: 700 } }>
					{fmt(ahp.weights[i], 3)}
				</td>
				<td style={tdStyle}>
					{fmt((ahp.weights[i] ?? 0) * 100, 1)}%
				</td>
			</tr>
		))}
		<tr>
			<td
				style={ { ...thStyle, textAlign: "right" } }
				colSpan={3}
			>
				Total
			</td>
			<td style={ { ...tdStyle, fontWeight: 700 } }>
				{fmt(
					ahp.weights.reduce((a, b) => a + (b || 0), 0),
					3,
				)}
			</td>
			<td style={ { ...tdStyle, fontWeight: 700 } }>100%</td>
		</tr>
	</tbody>
</table>
<p className="text-500 text-xs mt-1 mb-0">
	Inilah bobot final yang dipakai pada perhitungan SMART (kontribusi =
	bobot × utility).
</p>
			</Dialog>
		</div>
	)
}