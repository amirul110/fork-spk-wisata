import { useEffect, useState } from "react"
import {
	MapContainer,
	TileLayer,
	Marker,
	useMapEvents,
	useMap,
} from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"

// Perbaiki ikon marker default (rusak saat dibundling Vite)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
	iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
	iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
	shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// Paksa hitung ulang ukuran peta saat dirender di dalam Dialog
function PerbaikiUkuran() {
	const map = useMap()
	useEffect(() => {
		const t = setTimeout(() => map.invalidateSize(), 250)
		return () => clearTimeout(t)
	}, [map])
	return null
}

// Geser peta ke posisi hasil pencarian
function PindahPeta({ target }) {
	const map = useMap()
	useEffect(() => {
		if (target) map.flyTo([target.lat, target.lng], 15, { duration: 1 })
	}, [map, target])
	return null
}

function PenandaKlik({ posisi, setPosisi }) {
	useMapEvents({
		click(e) {
			setPosisi({ lat: e.latlng.lat, lng: e.latlng.lng })
		},
	})
	return posisi ? (
		<Marker
			position={[posisi.lat, posisi.lng]}
			draggable
			eventHandlers={ {
				dragend: (e) => {
					const p = e.target.getLatLng()
					setPosisi({ lat: p.lat, lng: p.lng })
				},
			} }
		/>
	) : null
}

export default function MapPicker({ center, initial, onConfirm, onCancel }) {
	const [posisi, setPosisi] = useState(
		initial ? { lat: initial.latitude, lng: initial.longitude } : null,
	)
	const [query, setQuery] = useState("")
	const [hasil, setHasil] = useState([])
	const [mencari, setMencari] = useState(false)
	const [pesan, setPesan] = useState("")
	const [target, setTarget] = useState(null)

	const titikAwal = initial
		? [initial.latitude, initial.longitude]
		: [center?.lat ?? -7.6514, center?.lng ?? 111.3292]

const cariAlamat = async () => {
	if (!query.trim()) return
	setMencari(true)
	setPesan("")
	setHasil([])
	try {
		const url =
			"https://nominatim.openstreetmap.org/search?format=json&q=" +
			encodeURIComponent(query) +
			"&limit=5&accept-language=id&countrycodes=id"
		const res = await fetch(url)
		const data = await res.json()
		if (Array.isArray(data) && data.length > 0) {
			setHasil(data)
		} else {
			setPesan("Alamat tidak ditemukan. Coba kata kunci lain.")
		}
	} catch {
		setPesan("Gagal mencari alamat. Periksa koneksi internet Anda.")
	} finally {
		setMencari(false)
	}
}

	const pilihHasil = (item) => {
		const lat = parseFloat(item.lat)
		const lng = parseFloat(item.lon)
		setPosisi({ lat, lng })
		setTarget({ lat, lng })
		setHasil([])
		setQuery(item.display_name)
	}

	return (
		<div className="flex flex-column gap-2">
			{/* Pencarian alamat langsung */}
			<div className="flex gap-2">
				<span className="p-input-icon-left flex-1">
					<i className="pi pi-search" />
					<InputText
						className="w-full"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && cariAlamat()}
						placeholder="Cari alamat / tempat, mis. Alun-alun Magetan"
					/>
				</span>
				<Button
					label="Cari"
					icon={mencari ? "pi pi-spin pi-spinner" : "pi pi-search"}
					onClick={cariAlamat}
					disabled={mencari}
				/>
			</div>

			{pesan ? <small className="p-error">{pesan}</small> : null}

			{hasil.length > 0 ? (
				<div
					style={ {
						maxHeight: 120,
						overflowY: "auto",
						border: "1px solid #e9ecef",
						borderRadius: 8,
					} }
				>
					{hasil.map((item) => (
						<div
							key={item.place_id}
							className="p-2 cursor-pointer hover:surface-100 text-sm"
							style={ { borderBottom: "1px solid #f1f3f5" } }
							onClick={() => pilihHasil(item)}
						>
							{item.display_name}
						</div>
					))}
				</div>
			) : null}

			<p className="m-0 text-color-secondary text-sm">
				Atau klik di peta / geser penanda untuk menentukan lokasi Anda.
			</p>

			{/* Tinggi peta responsif supaya tombol tetap terlihat tanpa scroll */}
			<div style={ { height: "45vh", minHeight: 240, maxHeight: 360, width: "100%" } }>
				<MapContainer
					center={titikAwal}
					zoom={13}
					style={ { height: "100%", width: "100%", borderRadius: 8 } }
				>
					<PerbaikiUkuran />
					<PindahPeta target={target} />
					<TileLayer
						attribution="&copy; OpenStreetMap contributors"
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>
					<PenandaKlik posisi={posisi} setPosisi={setPosisi} />
				</MapContainer>
			</div>

			{posisi ? (
				<span className="text-sm">
					Terpilih: {posisi.lat.toFixed(5)}, {posisi.lng.toFixed(5)}
				</span>
			) : null}

			<div className="flex justify-content-end gap-2">
				<Button label="Batal" severity="secondary" outlined onClick={onCancel} />
				<Button
					label="Gunakan Lokasi Ini"
					icon="pi pi-check"
					disabled={!posisi}
					onClick={() => onConfirm({ latitude: posisi.lat, longitude: posisi.lng })}
				/>
			</div>
		</div>
	)
}