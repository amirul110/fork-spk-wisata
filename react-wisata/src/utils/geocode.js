// Reverse geocoding pakai Nominatim (OpenStreetMap). Mendukung CORS, gratis.
export async function reverseGeocode(lat, lon) {
	const url =
		`https://nominatim.openstreetmap.org/reverse?format=json` +
		`&lat=${lat}&lon=${lon}&addressdetails=1&zoom=18&accept-language=id`

	const res = await fetch(url, { headers: { Accept: "application/json" } })
	if (!res.ok) throw new Error("Gagal mengambil detail lokasi")
	const data = await res.json()
	const a = data.address || {}

	return {
		desa: a.village || a.hamlet || a.suburb || a.neighbourhood || "-",
		kecamatan:
			a.subdistrict ||
			a.municipality ||
			a.city_district ||
			a.district ||
			a.town ||
			"-",
		kabupaten: a.county || a.regency || a.city || "-",
		provinsi: a.state || "-",
		kodePos: a.postcode || "-",
		alamatLengkap: data.display_name || "-",
	}
}