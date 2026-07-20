import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Card } from "primereact/card"
import { Button } from "primereact/button"
import { Message } from "primereact/message"
import { Dropdown } from "primereact/dropdown"
import { ProgressSpinner } from "primereact/progressspinner"

import api from "../../services/api"
import { getPreferensi } from "../../store/preferensiStore"
import { getAllKriteria, getSubKriteriaByKriteria } from "../../services/subkriteria.service"

// Nama fungsi diubah menjadi FilterWisata
export default function FilterWisata() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Mengambil lokasi dari halaman sebelumnya (PilihLokasi)
  const userLocation = location.state?.userLocation
  // Mengambil matriks bobot AHP dari local storage
  const preferensi = getPreferensi()

  const [kriteriaWithSub, setKriteriaWithSub] = useState([])
  const [loadingKriteria, setLoadingKriteria] = useState(false)
  const [userPrefs, setUserPrefs] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Fetch API Kriteria & Sub Kriteria (Hanya dipanggil jika lolos validasi)
  useEffect(() => {
    let isMounted = true;

    const fetchKriteriaDanSub = async () => {
      setLoadingKriteria(true)
      try {
        const resK = await getAllKriteria()
        const listK = resK.data?.data?.list_kriteria || []
        
        // Looping untuk mencari sub_kriteria tiap kriteria
        const fullData = await Promise.all(
          listK.map(async (k) => {
            const resS = await getSubKriteriaByKriteria(k.id_kriteria)
            return {
              ...k,
              sub_kriteria: resS.data?.data?.list_sub_kriteria || []
            }
          })
        )
        if (isMounted) setKriteriaWithSub(fullData)
      } catch (err) {
        console.error("Gagal memuat kriteria dan sub:", err)
        if (isMounted) setError("Gagal memuat data filter wisata dari server.")
      } finally {
        if (isMounted) setLoadingKriteria(false)
      }
    }

    // Hanya panggil API kalau data dasar (lokasi & AHP) sudah diisi oleh user
    if (userLocation && preferensi?.matrix) {
      fetchKriteriaDanSub()
    }

    return () => { isMounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) 

  const handleHitung = async () => {
    setError("")
    
    // Validasi Dropdown Sub Kriteria (pastikan user sudah memilih semua filter)
    const kriteriaWajib = kriteriaWithSub.filter(k => k.sub_kriteria && k.sub_kriteria.length > 0).length;
    const totalTerisi = Object.keys(userPrefs).length;
    if (totalTerisi < kriteriaWajib) {
        setError("Silakan lengkapi semua pilihan filter wisata di bawah ini.");
        return;
    }

    setSubmitting(true)
    try {
      const payload = {
        userLocation,
        matrix: preferensi.matrix,
        detail_preferensi: userPrefs
      }

      const res = await api.post("/rekomendasi/hitung", payload)
      const dataPayload = res?.data?.data || {}

      navigate("/wisatawan/hasil", {
        state: {
          hasil: dataPayload.hasil_rekomendasi || [],
          bobotAhp: dataPayload.bobot_ahp || [],
          cr: dataPayload.cr,
          lambdaMax: dataPayload.lambda_max,
          ci: dataPayload.ci,
          detailSmart: dataPayload.detail_smart || [],
        },
      })
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal menghitung rekomendasi.")
    } finally {
      setSubmitting(false)
    }
  }

  // =========================================================================
  // BLOK VALIDASI TAMPILAN (Mencegah user masuk jika data sebelumnya kosong)
  // =========================================================================

  if (!preferensi?.matrix) {
    return (
      <div className="p-3" style={{ maxWidth: 960, margin: "0 auto" }}>
        <Card className="shadow-1 text-center py-6 border-round-xl">
          <i className="pi pi-list text-6xl text-orange-500 mb-4"></i>
          <h2 className="mt-0 text-700">Preferensi Kriteria Belum Diisi</h2>
          <p className="text-600 mb-4" style={{ maxWidth: 500, margin: "0 auto" }}>
            Anda belum mengisi perbandingan kriteria. Sistem membutuhkan bobot kriteria Anda untuk dapat memfilter dan merekomendasikan wisata.
          </p>
          <Button 
            label="Ke Menu Pilih Kriteria" 
            icon="pi pi-arrow-right" 
            severity="warning" 
            onClick={() => navigate("/wisatawan/pilih-kriteria")} 
          />
        </Card>
      </div>
    )
  }

  if (!userLocation) {
    return (
      <div className="p-3" style={{ maxWidth: 960, margin: "0 auto" }}>
        <Card className="shadow-1 text-center py-6 border-round-xl">
          <i className="pi pi-map-marker text-6xl text-blue-500 mb-4"></i>
          <h2 className="mt-0 text-700">Lokasi Anda Belum Aktif</h2>
          <p className="text-600 mb-4" style={{ maxWidth: 500, margin: "0 auto" }}>
            Sistem membutuhkan koordinat lokasi Anda saat ini untuk menghitung jarak ke berbagai tempat wisata. 
            <br /><br />
            Pastikan Anda mengakses halaman ini dengan menekan tombol <b>"Lanjut"</b> dari menu Aktifkan Lokasi.
          </p>
          <Button 
            label="Ke Menu Aktifkan Lokasi" 
            icon="pi pi-arrow-right" 
            onClick={() => navigate("/wisatawan/pilih-lokasi")} 
          />
        </Card>
      </div>
    )
  }

  // =========================================================================
  // RENDER FORM UTAMA (Jika semua data lengkap)
  // =========================================================================

  return (
    <div className="p-3" style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Teks Judul Diubah */}
      <h2 className="mb-1">Langkah 3: Filter Wisata</h2>
      <p className="text-color-secondary mt-0 mb-3">
        Lengkapi filter pencarian Anda (misal: budget tiket, kelengkapan atraksi) agar sistem dapat merekomendasikan wisata yang paling sesuai dengan keinginan Anda.
      </p>

      {error ? <Message severity="warn" text={error} className="w-full mb-3" /> : null}

      <Card className="mb-4 shadow-1 border-round-lg">
        {loadingKriteria ? (
            <div className="flex justify-content-center py-6">
                <ProgressSpinner style={{ width: '40px', height: '40px' }} />
            </div>
        ) : (
            <div className="grid">
                {kriteriaWithSub.map(k => {
                    // Jika admin belum mengisi sub kriteria, jangan tampilkan
                    if (!k.sub_kriteria || k.sub_kriteria.length === 0) return null;

                    return (
                        <div key={k.id_kriteria} className="col-12 md:col-6 mb-3">
                            <label className="font-bold text-sm block mb-2">{k.nama_kriteria}</label>
                            <Dropdown
                                className="w-full"
                                options={k.sub_kriteria}
                                optionLabel="nama_sub_kriteria"
                                optionValue="id_sub"
                                value={userPrefs[k.id_kriteria]}
                                onChange={(e) => setUserPrefs({ ...userPrefs, [k.id_kriteria]: e.value })}
                                placeholder={`-- Filter ${k.nama_kriteria} --`}
                            />
                        </div>
                    )
                })}
            </div>
        )}
      </Card>

      <div className="flex justify-content-between mb-5">
        <Button
          label="Kembali"
          icon="pi pi-arrow-left"
          severity="secondary"
          outlined
          onClick={() => navigate("/wisatawan/pilih-lokasi")}
        />
        <Button
          label="Hitung Rekomendasi"
          icon="pi pi-check"
          iconPos="right"
          onClick={handleHitung}
          loading={submitting}
          disabled={loadingKriteria}
          style={{ padding: "0.8rem 2rem" }}
        />
      </div>
    </div>
  )
}