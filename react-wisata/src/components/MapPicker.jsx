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

// Perbaiki ikon marker default (rusak saat dibundling Vite)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
	iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
	shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// Penting saat peta dirender di dalam Dialog: paksa hitung ulang ukuran
function PerbaikiUkuran() {
	const map = useMap()
	useEffect(() => {
		const t = setTimeout(() => map.invalidateSize(), 250)
		return () => clearTimeout(t)
	}, [map])
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

	const titikAwal = initial
		? [initial.latitude, initial.longitude]
		: [center?.lat ?? -7.6514, center?.lng ?? 111.3292]

	return (
		<div className="flex flex-column gap-3">
			<p className="m-0 text-color-secondary">
				Klik di peta atau geser penanda untuk menentukan lokasi Anda.
			</p>
			<div style={ { height: 400, width: "100%" } }>
				<MapContainer
					center={titikAwal}
					zoom={13}
					style={ { height: "100%", width: "100%", borderRadius: 8 } }
				>
					<PerbaikiUkuran />
					<TileLayer
						attribution='&copy; OpenStreetMap contributors'
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
				<Button
					label="Batal"
					severity="secondary"
					outlined
					onClick={onCancel}
				/>
				<Button
					label="Gunakan Lokasi Ini"
					icon="pi pi-check"
					disabled={!posisi}
					onClick={() =>
						onConfirm({ latitude: posisi.lat, longitude: posisi.lng })
					}
				/>
			</div>
		</div>
	)
}