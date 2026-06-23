const KEY = "spk_preferensi"

export function setPreferensi(data) {
	sessionStorage.setItem(KEY, JSON.stringify(data))
}

export function getPreferensi() {
	try {
		const raw = sessionStorage.getItem(KEY)
		return raw ? JSON.parse(raw) : null
	} catch {
		return null
	}
}

export function clearPreferensi() {
	sessionStorage.removeItem(KEY)
}