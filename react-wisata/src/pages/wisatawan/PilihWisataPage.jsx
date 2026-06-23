import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card } from "primereact/card"
import { Button } from "primereact/button"
import { Dropdown } from "primereact/dropdown"
import { Message } from "primereact/message"
import { Tag } from "primereact/tag"
import {
	KRITERIA_AHP,
	PASANGAN_AHP,
	bangunMatriks,
	hitungAHP,
} from "../../utils/ahp"
import { setPreferensi } from "../../store/preferensiStore"

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

export default function PilihWisataPage() {
	const navigate = useNavigate()
	const [nilai, setNilai] = useState(() => PASANGAN_AHP.map(() => 1))
	const [error, setError] = useState("")

	const ahp = useMemo(() => {
		const matrix = bangunMatriks(nilai, KRITERIA_AHP.length)
		return { matrix, ...hitungAHP(matrix) }
	}, [nilai])

	const konsisten = ahp.CR < 0.1

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
				`Perbandingan tidak konsisten (CR = ${ahp.CR.toFixed(
					4,
				)} ≥ 0.1). Silakan ulangi.`,
			)
			return
		}
		setPreferensi({
			matrix: ahp.matrix,
			weights: ahp.weights,
			cr: Number(ahp.CR.toFixed(4)),
		})
		navigate("/wisatawan/pilih-lokasi")
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
						const persen = ((ahp.weights?.[i] ?? 0) * 100).toFixed(1)
						return (
							<div key={k.id} className="flex align-items-center gap-2">
								<span style={ { width: 200 } }>
									{k.nama}{" "}
									<Tag
										value={k.jenis === "benefit" ? "benefit" : "cost"}
										severity={
											k.jenis === "benefit" ? "success" : "danger"
										}
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
											width: `${persen}%`,
											height: "100%",
											background: "#3b82f6",
										} }
									/>
								</div>
								<span style={ { width: 56, textAlign: "right" } }>
									{persen}%
								</span>
							</div>
						)
					})}
				</div>

				<div className="flex align-items-center gap-2">
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

			<div className="flex justify-content-end">
				<Button
					label="Simpan & Lanjut: Aktifkan Lokasi"
					icon="pi pi-arrow-right"
					iconPos="right"
					onClick={lanjut}
					disabled={!konsisten}
				/>
			</div>
		</div>
	)
}