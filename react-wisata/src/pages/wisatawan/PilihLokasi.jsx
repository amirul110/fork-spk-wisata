import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card } from "primereact/card"
import { Button } from "primereact/button"
import { Message } from "primereact/message"
import { Dialog } from "primereact/dialog"
import { getAllWisata } from "../../services/wisata.service"
import MapPicker from "../../components/MapPicker"
import { reverseGeocode } from "../../utils/geocode"
import { getPreferensi } from "../../store/preferensiStore"

const MAGETAN_CENTER = { lat: -7.6514, lng: 111.3292 }

function hitungJarakKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function PilihWisata() {
  const navigate = useNavigate()

  const [userLocation, setUserLocation] = useState(() => {
    const saved = sessionStorage.getItem("spk_user_loc");
    return saved ? JSON.parse(saved) : null;
  });

  const [detailLokasi, setDetailLokasi] = useState(null)
  const [loadingGeo, setLoadingGeo] = useState(false)
  const [mapVisible, setMapVisible] = useState(false)
  const [wisataList, setWisataList] = useState([])
  const [loadingWisata, setLoadingWisata] = useState(false)
  const [error, setError] = useState("")

  const preferensi = getPreferensi() // { matrix, weights, cr }

  useEffect(() => {
    let aktif = true
    setLoadingWisata(true)

    // Langsung ambil detail alamat saat awal load jika koordinat sudah ada
    if (userLocation) {
      ambilDetail(userLocation.latitude, userLocation.longitude);
    }

    getAllWisata()
      .then((res) => {
        if (!aktif) return
        setWisataList(res?.data?.data?.list_wisata || [])
      })
      .catch(() => {})
      .finally(() => {
        if (aktif) setLoadingWisata(false)
      })

    return () => {
      aktif = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const ambilDetail = async (lat, lon) => {
    setLoadingGeo(true)
    try {
      setDetailLokasi(await reverseGeocode(lat, lon))
    } catch {
      setDetailLokasi(null)
    } finally {
      setLoadingGeo(false)
    }
  }

  const gunakanGPS = () => {
    setError("")
    if (!navigator.geolocation) {
      setError("Browser tidak mendukung GPS. Silakan pilih lewat peta.")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lokasi = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }
        setUserLocation(lokasi)
        sessionStorage.setItem("spk_user_loc", JSON.stringify(lokasi))
        ambilDetail(lokasi.latitude, lokasi.longitude)
      },
      (err) => {
        let pesanPenyebab = "Gagal mengambil lokasi GPS.";
        
        if (err.code === err.PERMISSION_DENIED) {
          pesanPenyebab = "Izin akses lokasi ditolak oleh browser HP Anda.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          pesanPenyebab = "Sinyal GPS tidak tersedia saat ini.";
        } else if (err.code === err.TIMEOUT) {
          pesanPenyebab = "Pencarian lokasi butuh waktu terlalu lama (Timeout).";
        }

        setError(`${pesanPenyebab} Silakan pilih lewat peta.`);
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    )
  }

  const onPilihPeta = (loc) => {
    setUserLocation(loc)
    sessionStorage.setItem("spk_user_loc", JSON.stringify(loc))
    setMapVisible(false)
    ambilDetail(loc.latitude, loc.longitude)
  }

  const daftarJarak = useMemo(() => {
    if (!userLocation) return []
    return wisataList
      .map((w) => {
        const lat = Number(w.latitude ?? w.lat)
        const lon = Number(w.longitude ?? w.lng)
        const jarak =
          Number.isFinite(lat) && Number.isFinite(lon)
            ? hitungJarakKm(
                userLocation.latitude,
                userLocation.longitude,
                lat,
                lon,
              )
            : null
        return {
          id: w.id_wisata ?? w.id,
          nama: w.nama_wisata ?? w.nama ?? "Wisata",
          jarak_km: jarak,
        }
      })
      .sort((a, b) => (a.jarak_km ?? Infinity) - (b.jarak_km ?? Infinity))
  }, [userLocation, wisataList])

  const handleLanjut = () => {
    setError("")
    
    if (!preferensi?.matrix) {
      setError("Anda belum mengisi preferensi bobot.")
      return
    }

    if (!userLocation) {
      setError("Tentukan lokasi Anda terlebih dahulu (GPS atau peta).")
      return
    }

    // Lempar lokasi user ke halaman PilihPreferensi
    navigate("/wisatawan/filter-wisata", {
      state: { userLocation: userLocation }
    })
  }

  return (
    <div className="p-3" style={{ maxWidth: 960, margin: "0 auto" }}>
      <h2 className="mb-1">Aktifkan Lokasi Anda</h2>
      <p className="text-color-secondary mt-0 mb-3">
        Tentukan lokasi Anda untuk melihat jarak ke semua wisata, lalu lanjut lengkapi preferensi.
      </p>

      {!preferensi?.matrix ? (
        <Message
          severity="info"
          text="Anda belum mengisi preferensi bobot. Buka menu 'Pilih Kriteria' terlebih dahulu."
          className="w-full mb-3"
        />
      ) : null}

      {error ? (
        <Message severity="warn" text={error} className="w-full mb-3" />
      ) : null}

      <Card title="Lokasi Anda & Jarak ke Wisata" className="mb-3">
        <div className="flex gap-2 mb-3 flex-wrap">
          <Button
            label="Gunakan GPS"
            icon="pi pi-map-marker"
            onClick={gunakanGPS}
            loading={loadingGeo}
            outlined
          />
          <Button
            label="Pilih di Peta"
            icon="pi pi-map"
            onClick={() => setMapVisible(true)}
            outlined
          />
        </div>

        {userLocation ? (
          <>
            <p className="m-0 mb-2">
              Koordinat:{" "}
              <b>
                {userLocation.latitude.toFixed(5)},{" "}
                {userLocation.longitude.toFixed(5)}
              </b>
            </p>

            {loadingGeo ? (
              <p className="m-0 mb-3 text-color-secondary">
                Mengambil detail alamat…
              </p>
            ) : detailLokasi ? (
              <div
                className="mb-3 p-3"
                style={{
                  background: "#f8f9fa",
                  borderRadius: 8,
                  lineHeight: 1.7,
                }}
              >
                <div>
                  <b>Desa/Kelurahan:</b> {detailLokasi.desa}
                </div>
                <div>
                  <b>Kecamatan:</b> {detailLokasi.kecamatan}
                </div>
                <div>
                  <b>Kabupaten/Kota:</b> {detailLokasi.kabupaten}
                </div>
                <div>
                  <b>Provinsi:</b> {detailLokasi.provinsi}
                </div>
                <div>
                  <b>Kode Pos:</b> {detailLokasi.kodePos}
                </div>
                <div className="mt-1 text-color-secondary">
                  {detailLokasi.alamatLengkap}
                </div>
              </div>
            ) : null}

            <h4 className="mb-2">Jarak ke Semua Wisata</h4>
            <div
              style={{
                maxHeight: 260,
                overflowY: "auto",
                border: "1px solid #e9ecef",
                borderRadius: 8,
              }}
            >
              {loadingWisata ? (
                <p className="p-3 m-0">Memuat daftar wisata…</p>
              ) : (
                daftarJarak.map((w) => (
                  <div
                    key={w.id}
                    className="flex justify-content-between p-2"
                    style={{ borderBottom: "1px solid #f1f3f5" }}
                  >
                    <span>{w.nama}</span>
                    <span className="font-medium">
                      {w.jarak_km != null
                        ? `${w.jarak_km.toFixed(2)} km`
                        : "—"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <p className="text-color-secondary m-0">
            Belum ada lokasi. Tentukan lokasi untuk melihat jarak ke semua
            wisata.
          </p>
        )}
      </Card>

      <div className="flex justify-content-end mb-5">
        <Button
          label="Lanjut: Filter Wisata"
          icon="pi pi-arrow-right"
          iconPos="right"
          onClick={handleLanjut}
          disabled={!userLocation || !preferensi?.matrix}
          style={{ padding: "0.8rem 2rem" }}
        />
      </div>

      <Dialog
        header="Pilih Lokasi"
        visible={mapVisible}
        style={{ width: "90vw", maxWidth: 720 }}
        onHide={() => setMapVisible(false)}
      >
        <MapPicker
          center={MAGETAN_CENTER}
          initial={userLocation}
          onConfirm={onPilihPeta}
          onCancel={() => setMapVisible(false)}
        />
      </Dialog>
    </div>
  )
}