import { useLocation, useNavigate } from "react-router-dom"
import { useMemo, useState } from "react"
import { Card } from "primereact/card"
import { Button } from "primereact/button"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Message } from "primereact/message"
import { Tag } from "primereact/tag"
import { Dialog } from "primereact/dialog"
import { Dropdown } from "primereact/dropdown"
import { formatTanggalIndonesia } from "../../utils/formatTanggal"

const fmt = (v, d = 4) =>
	v === null || v === undefined || isNaN(Number(v))
		? "-"
		: Number(v).toFixed(d)

export default function HasilRekomendasi() {
	const location = useLocation()
	const nav = useNavigate()

	// === Bungkus semua state.location di useMemo agar referensi stabil ===
	const hasil = useMemo(
		() => location.state?.hasil || [],
		[location.state?.hasil],
	)
	const bobotAhp = useMemo(
		() => location.state?.bobotAhp || [],
		[location.state?.bobotAhp],
	)
	const detailSmart = useMemo(
		() => location.state?.detailSmart || [],
		[location.state?.detailSmart],
	)
	const cr = location.state?.cr
	const lambdaMax = location.state?.lambdaMax
	const ci = location.state?.ci

	const [detailDialog, setDetailDialog] = useState(false)
	const [selectedWisata, setSelectedWisata] = useState(null)

	const [perhitunganOpen, setPerhitunganOpen] = useState(false)
	const [pilihAlternatif, setPilihAlternatif] = useState(
		detailSmart[0]?.id_alternatif ?? null,
	)

	const alternatifTerpilih = useMemo(
		() =>
			detailSmart.find((d) => d.id_alternatif === pilihAlternatif) ||
			detailSmart[0] ||
			null,
		[detailSmart, pilihAlternatif],
	)

	const konsisten = cr !== undefined && cr !== null ? cr < 0.1 : null

	// Daftar kriteria yang muncul (urutkan berdasar urutan dari detail pertama)
	const daftarKriteria = useMemo(() => {
		if (!detailSmart[0]?.detail) return []
		return detailSmart[0].detail.map((d) => ({
			id_kriteria: d.id_kriteria,
			nama_kriteria: d.nama_kriteria,
			jenis: d.jenis,
		}))
	}, [detailSmart])

	const hargaTemplate = (rowData) =>
		`Rp ${Number(rowData.harga_tiket).toLocaleString("id-ID")}`

	const peringkatTemplate = (rowData) => (
		<Tag
			value={`#${rowData.peringkat_ke}`}
			severity={
				rowData.peringkat_ke === 1
					? "success"
					: rowData.peringkat_ke <= 3
						? "info"
						: null
			}
		/>
	)

	const detailTemplate = (rowData) => (
		<Button
			icon="pi pi-info-circle"
			severity="info"
			size="small"
			rounded
			onClick={() => {
				setSelectedWisata(rowData)
				setDetailDialog(true)
			}}
			tooltip="Lihat Detail Wisata"
			tooltipOptions={ { position: "top" } }
		/>
	)

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
		<>
			<div className="mb-4">
				<div
					className="mb-2 text-color-secondary"
					style={ { fontSize: "0.9rem" } }
				>
					{formatTanggalIndonesia()}
				</div>
				<h2 className="text-2xl font-bold text-800 mt-0 mb-2">
					<i className="pi pi-chart-bar mr-2"></i>Hasil Rekomendasi Wisata
				</h2>
				<hr className="border-top-1 border-300" />
			</div>

			{hasil.length === 0 ? (
				<Card className="shadow-1">
					<div className="text-center p-4">
						<i className="pi pi-info-circle text-4xl text-500 mb-3"></i>
						<p className="font-semibold text-700">
							Belum ada data hasil rekomendasi. Silakan pilih kriteria di
							Menu Pilih Kriteria dan aktifkan lokasi terlebih dahulu.
						</p>
						<Button
							label="Ke Pilih Kriteria"
							icon="pi pi-arrow-left"
							onClick={() => nav("/wisatawan/pilih-kriteria")}
							className="mt-2"
						/>
					</div>
				</Card>
			) : (
				<>
					<Message
						severity="success"
						text="Berikut adalah hasil rekomendasi wisata menggunakan kombinasi metode AHP (bobot kriteria) dan SMART (nilai akhir alternatif):"
						className="w-full mb-4"
					/>

					<div className="flex justify-content-end mb-3">
						<Button
							label="Lihat Detail Perhitungan AHP + SMART"
							icon="pi pi-calculator"
							severity="info"
							outlined
							onClick={() => setPerhitunganOpen(true)}
						/>
					</div>

					<Card className="shadow-2 mb-4">
						<DataTable
							value={hasil}
							stripedRows
							showGridlines
							responsiveLayout="scroll"
						>
							<Column
								header="Peringkat"
								body={peringkatTemplate}
								style={ { width: "8rem" } }
							/>
							<Column field="nama_wisata" header="Nama Wisata" />
							<Column
								header="Harga Tiket"
								body={hargaTemplate}
								style={ { width: "10rem" } }
							/>
							<Column
								field="jarak_dari_anda"
								header="Jarak dari Anda"
								style={ { width: "10rem" } }
							/>
							<Column
								field="skor_rekomendasi"
								header="Skor Akhir SMART"
								style={ { width: "9rem" } }
							/>
							<Column
								header="Detail"
								body={detailTemplate}
								style={ { width: "6rem" } }
							/>
						</DataTable>
					</Card>

					{/* DIALOG DETAIL WISATA */}
					<Dialog
						visible={detailDialog}
						header="Detail Informasi Wisata"
						modal
						style={ { width: "90vw", maxWidth: 600 } }
						onHide={() => setDetailDialog(false)}
					>
						{selectedWisata && (
							<div className="flex flex-column gap-3">
								<h3 className="text-xl font-bold text-800 mt-0 mb-2">
									{selectedWisata.nama_wisata}
								</h3>
								<hr className="mt-0 mb-2" />
								<div className="grid">
									<div className="col-12 md:col-6">
										<div className="mb-3">
											<span className="font-bold text-600 text-sm">Harga Tiket</span>
											<div className="text-800 font-semibold mt-1">
												Rp {Number(selectedWisata.harga_tiket).toLocaleString("id-ID")}
											</div>
										</div>
									</div>
									<div className="col-12 md:col-6">
										<div className="mb-3">
											<span className="font-bold text-600 text-sm">Rating Google Maps</span>
											<div className="text-800 font-semibold mt-1">
												<i className="pi pi-star-fill text-yellow-500 mr-1"></i>
												{selectedWisata.rating_gmaps}
											</div>
										</div>
									</div>
									<div className="col-12 md:col-6">
										<div className="mb-3">
											<span className="font-bold text-600 text-sm">Jarak dari Anda</span>
											<div className="text-800 font-semibold mt-1">
												<i className="pi pi-map-marker text-red-500 mr-1"></i>
												{selectedWisata.jarak_dari_anda}
											</div>
										</div>
									</div>
									<div className="col-12">
										<div className="mb-3">
											<span className="font-bold text-600 text-sm">Atraksi Wisata</span>
											<div className="text-800 mt-1">
												{selectedWisata.atraksi_wisata || "-"}
											</div>
										</div>
									</div>
									<div className="col-12">
										<div className="mb-0">
											<span className="font-bold text-600 text-sm">Skor Rekomendasi (SMART)</span>
											<div className="text-800 font-semibold mt-1">
												<Tag value={selectedWisata.skor_rekomendasi} severity="success" />
											</div>
										</div>
									</div>
								</div>
							</div>
						)}
					</Dialog>

					{/* DIALOG DETAIL PERHITUNGAN AHP + SMART */}
					<Dialog
						visible={perhitunganOpen}
						header="Detail Perhitungan AHP + SMART"
						modal
						style={ { width: "95vw", maxWidth: 1000 } }
						onHide={() => setPerhitunganOpen(false)}
					>
						{/* ============ BAGIAN 1: AHP ============ */}
						<h3 className="text-lg font-bold text-800 mt-0 mb-2">
							1. Bobot Kriteria (AHP)
						</h3>

						{bobotAhp.length === 0 ? (
							<Message
								severity="warn"
								className="w-full mb-3"
								text="Rincian bobot AHP tidak tersedia. Lakukan perhitungan ulang dari menu Aktifkan Lokasi agar detail muncul."
							/>
						) : (
							<>
								<p className="text-600 text-sm mt-0 mb-2">
									Bobot prioritas (eigen vektor) hasil AHP:
								</p>
								<table style={ { width: "100%", borderCollapse: "collapse", marginBottom: "1rem" } }>
									<thead>
										<tr>
											<th style={thStyle}>Kriteria</th>
											<th style={thStyle}>Jenis</th>
											<th style={thStyle}>Bobot</th>
										</tr>
									</thead>
									<tbody>
										{bobotAhp.map((b) => (
											<tr key={b.id_kriteria}>
												<td style={ { ...tdStyle, textAlign: "left" } }>
													{b.nama_kriteria || `C${b.id_kriteria}`}
												</td>
												<td style={tdStyle}>
													<Tag
														value={b.jenis === "cost" ? "Cost" : "Benefit"}
														severity={b.jenis === "cost" ? "warning" : "success"}
													/>
												</td>
												<td style={tdStyle}>{fmt(b.bobot, 4)}</td>
											</tr>
										))}
									</tbody>
								</table>

								<div className="flex flex-wrap gap-2 mb-2">
									<Tag value={`λ max = ${fmt(lambdaMax, 4)}`} severity="info" />
									<Tag value={`CI = ${fmt(ci, 4)}`} severity="info" />
									<Tag value={`CR = ${fmt(cr, 4)}`} severity="info" />
									{konsisten !== null && (
										<Tag
											value={konsisten ? "Konsisten (CR < 0.1)" : "Tidak konsisten (CR ≥ 0.1)"}
											severity={konsisten ? "success" : "danger"}
										/>
									)}
								</div>
								<p className="text-500 text-xs mt-2 mb-0">
									Detail 6 langkah AHP (matriks → ternormalisasi → eigen → λmax → CI/CR) dapat dilihat di halaman <b>Preferensi Kriteria</b>.
								</p>
							</>
						)}

						<hr className="my-3" />

						{/* ============ BAGIAN 2: SMART ============ */}
						<h3 className="text-lg font-bold text-800 mt-0 mb-2">
							2. Perhitungan SMART
						</h3>

						{detailSmart.length === 0 || daftarKriteria.length === 0 ? (
							<Message
								severity="warn"
								className="w-full"
								text="Rincian SMART tidak tersedia. Lakukan perhitungan ulang dari menu Aktifkan Lokasi agar detail muncul."
							/>
						) : (
							<>
								{/* LANGKAH 1: Konversi 1-5 */}
								<h4 className="text-base font-bold text-800 mb-2">
									Langkah 1 — Konversi Nilai Alternatif ke Skala 1–5
								</h4>
								<div style={ { overflowX: "auto", marginBottom: "1rem" } }>
									<table style={ { width: "100%", borderCollapse: "collapse", minWidth: 600 } }>
										<thead>
											<tr>
												<th style={thStyle}>Alternatif</th>
												{daftarKriteria.map((k) => (
													<th key={k.id_kriteria} style={thStyle}>
														{k.nama_kriteria}
														<div>
															<Tag
																value={k.jenis === "cost" ? "Cost" : "Benefit"}
																severity={k.jenis === "cost" ? "warning" : "success"}
															/>
														</div>
													</th>
												))}
											</tr>
										</thead>
										<tbody>
											{detailSmart.map((a) => (
												<tr key={a.id_alternatif}>
													<td style={ { ...tdStyle, textAlign: "left", fontWeight: 600 } }>
														{a.nama_wisata}
													</td>
													{a.detail.map((d) => (
														<td key={d.id_kriteria} style={tdStyle}>
															{d.nilai_skala}
														</td>
													))}
												</tr>
											))}
										</tbody>
									</table>
								</div>

								{/* LANGKAH 2: Matriks Ternormalisasi (Utility) */}
								<h4 className="text-base font-bold text-800 mb-2">
									Langkah 2 — Normalisasi Utility (Matriks Ternormalisasi)
								</h4>
								<p className="text-600 text-sm mt-0 mb-2">
									<b>Benefit:</b> u = (Cout − Cmin) / (Cmax − Cmin) ={" "}
									<b>(nilai − 1) / 4</b>
									<br />
									<b>Cost:</b> u = (Cmax − Cout) / (Cmax − Cmin) ={" "}
									<b>(5 − nilai) / 4</b>
								</p>
								<div style={ { overflowX: "auto", marginBottom: "1rem" } }>
									<table style={ { width: "100%", borderCollapse: "collapse", minWidth: 600 } }>
										<thead>
											<tr>
												<th style={thStyle}>Alternatif</th>
												{daftarKriteria.map((k) => (
													<th key={k.id_kriteria} style={thStyle}>
														{k.nama_kriteria}
													</th>
												))}
											</tr>
										</thead>
										<tbody>
											{detailSmart.map((a) => (
												<tr key={a.id_alternatif}>
													<td style={ { ...tdStyle, textAlign: "left", fontWeight: 600 } }>
														{a.nama_wisata}
													</td>
													{a.detail.map((d) => (
														<td key={d.id_kriteria} style={tdStyle}>
															{fmt(d.utility, 4)}
														</td>
													))}
												</tr>
											))}
											<tr>
												<td style={ { ...thStyle, textAlign: "right" } }>Bobot (wⱼ)</td>
												{daftarKriteria.map((k) => {
													const b = bobotAhp.find((x) => x.id_kriteria === k.id_kriteria)
													return (
														<td key={k.id_kriteria} style={ { ...tdStyle, fontWeight: 700 } }>
															{fmt(b?.bobot, 4)}
														</td>
													)
												})}
											</tr>
										</tbody>
									</table>
								</div>

								{/* LANGKAH 3: Per-Alternatif Breakdown */}
								<h4 className="text-base font-bold text-800 mb-2">
									Langkah 3 — Perhitungan Nilai Akhir (per Alternatif)
								</h4>
								<p className="text-600 text-sm mt-0 mb-3">
									<b>u(aᵢ) = Σⱼ (wⱼ × uᵢⱼ)</b>
								</p>
								<div className="mb-3">
									<Dropdown
										value={pilihAlternatif}
										onChange={(e) => setPilihAlternatif(e.value)}
										options={detailSmart.map((d) => ({
											label: `#${d.peringkat_ke} — ${d.nama_wisata}`,
											value: d.id_alternatif,
										}))}
										placeholder="Pilih alternatif wisata"
										className="w-full"
									/>
								</div>

								{alternatifTerpilih && (
									<>
										<div className="mb-2 font-semibold text-800">
											{alternatifTerpilih.nama_wisata}
										</div>
										<table style={ { width: "100%", borderCollapse: "collapse", marginBottom: "1rem" } }>
											<thead>
												<tr>
													<th style={thStyle}>Kriteria</th>
													<th style={thStyle}>Jenis</th>
													<th style={thStyle}>Nilai (1–5)</th>
													<th style={thStyle}>Rumus Utility</th>
													<th style={thStyle}>Utility</th>
													<th style={thStyle}>Bobot</th>
													<th style={thStyle}>Kontribusi</th>
												</tr>
											</thead>
											<tbody>
												{alternatifTerpilih.detail.map((d) => (
													<tr key={d.id_kriteria}>
														<td style={ { ...tdStyle, textAlign: "left" } }>{d.nama_kriteria}</td>
														<td style={tdStyle}>
															<Tag
																value={d.jenis === "cost" ? "Cost" : "Benefit"}
																severity={d.jenis === "cost" ? "warning" : "success"}
															/>
														</td>
														<td style={tdStyle}>{d.nilai_skala}</td>
														<td style={tdStyle}>{d.rumus_utility}</td>
														<td style={tdStyle}>{fmt(d.utility, 4)}</td>
														<td style={tdStyle}>{fmt(d.bobot, 4)}</td>
														<td style={tdStyle}>{fmt(d.kontribusi, 4)}</td>
													</tr>
												))}
												<tr>
													<td
														style={ { ...tdStyle, textAlign: "right", fontWeight: 700 } }
														colSpan={6}
													>
														Skor Akhir u(aᵢ)
													</td>
													<td style={ { ...tdStyle, fontWeight: 700 } }>
														{fmt(alternatifTerpilih.skor_akhir, 4)}
													</td>
												</tr>
											</tbody>
										</table>
									</>
								)}

								{/* LANGKAH 4: Perangkingan Akhir */}
								<h4 className="text-base font-bold text-800 mb-2">
									Langkah 4 — Tabel Perangkingan Akhir
								</h4>
								<table style={ { width: "100%", borderCollapse: "collapse" } }>
									<thead>
										<tr>
											<th style={thStyle}>Peringkat</th>
											<th style={thStyle}>Alternatif</th>
											<th style={thStyle}>Skor Akhir</th>
										</tr>
									</thead>
									<tbody>
										{detailSmart.map((a) => (
											<tr key={a.id_alternatif}>
												<td style={tdStyle}>
													<Tag
														value={`#${a.peringkat_ke}`}
														severity={
															a.peringkat_ke === 1
																? "success"
																: a.peringkat_ke <= 3
																	? "info"
																	: null
														}
													/>
												</td>
												<td style={ { ...tdStyle, textAlign: "left" } }>{a.nama_wisata}</td>
												<td style={ { ...tdStyle, fontWeight: 700 } }>{fmt(a.skor_akhir, 4)}</td>
											</tr>
										))}
									</tbody>
								</table>
							</>
						)}
					</Dialog>

					<div className="flex justify-content-center gap-3">
						<Button
							label="Pilih Wisata Lagi"
							icon="pi pi-arrow-left"
							severity="secondary"
							onClick={() => nav("/wisatawan/dashboard")}
						/>
						<Button
							label="Aktifkan Lokasi Ulang"
							icon="pi pi-refresh"
							onClick={() => nav("/wisatawan/pilih-lokasi")}
						/>
					</div>
				</>
			)}
		</>
	)
}