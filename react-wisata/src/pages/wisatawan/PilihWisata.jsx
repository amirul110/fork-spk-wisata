import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getSelectedWisata, clearSelectedWisata } from "../../store/wisataStore";
import { getAllWisata } from "../../services/wisata.service";
import { getAllKriteria } from "../../services/kriteria.service";
import api from "../../services/api";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Message } from "primereact/message";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { Chip } from "primereact/chip";
import MapPickerDialog from "../../components/MapPickerDialog";
import { formatTanggalIndonesia } from "../../utils/formatTanggal";

const BOBOT_OPTIONS = [
  { value: 1, label: "1 - Sama penting" },
  { value: 2, label: "2 - Di antara 1 dan 3" },
  { value: 3, label: "3 - Sedikit lebih penting" },
  { value: 4, label: "4 - Di antara 3 dan 5" },
  { value: 5, label: "5 - Lebih penting" },
  { value: 6, label: "6 - Di antara 5 dan 7" },
  { value: 7, label: "7 - Jelas lebih penting" },
  { value: 8, label: "8 - Di antara 7 dan 9" },
  { value: 9, label: "9 - Mutlak lebih penting" },
];

export default function PilihWisata() {
  const nav = useNavigate();
  const [kriteriaList, setKriteriaList] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("belum");
  const [locationMode, setLocationMode] = useState("");
  const [perbandinganAHP, setPerbandinganAHP] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [showLocationChoice, setShowLocationChoice] = useState(false);
  const [belumPilihWisata, setBelumPilihWisata] = useState(false);
  const [namaWisataDipilih, setNamaWisataDipilih] = useState([]);
  const [showConfirmDashboard, setShowConfirmDashboard] = useState(false);
  const [gpsInitialPos, setGpsInitialPos] = useState(null);
  const [mapDialogTitle, setMapDialogTitle] = useState("");

  // Guard: tampilkan pesan jika belum memilih wisata di dashboard
  useEffect(() => {
    const selected = getSelectedWisata();
    
    // Fetch kriteria from backend
    getAllKriteria()
      .then((res) => {
        const kriteriaData = res.data?.data?.list_kriteria || [];
        const formattedKriteria = kriteriaData.map((k) => ({
          id: k.id_kriteria,
          nama: k.nama_kriteria,
          deskripsi: k.deskripsi || ''
        }));
        setKriteriaList(formattedKriteria);
        
        const initialPairwise = {};
        for (let i = 0; i < kriteriaData.length; i++) {
          for (let j = i + 1; j < kriteriaData.length; j++) {
            const idA = kriteriaData[i].id_kriteria;
            const idB = kriteriaData[j].id_kriteria;
            initialPairwise[`${idA}-${idB}`] = { moreImportant: null, intensity: null };
          }
        }
        setPerbandinganAHP(initialPairwise);
      })
      .catch((err) => {
        console.error("Failed to load kriteria:", err);
        setErrorMsg("Gagal memuat kriteria. Silakan refresh halaman.");
      });
    
    if (!selected || selected.length === 0) {
      // setTimeout(0) diperlukan agar ESLint react-hooks/set-state-in-effect tidak error
      setTimeout(() => setBelumPilihWisata(true), 0);
    } else {
      // Ambil nama wisata yang dipilih dari backend
      getAllWisata()
        .then((res) => {
          const allWisata = res.data?.data?.list_wisata || [];
          const names = allWisata
            .filter((w) => selected.includes(w.id_alternatif))
            .map((w) => w.nama_wisata);
          setNamaWisataDipilih(names);
        })
        .catch(() => {
          // Fallback jika API gagal
          setNamaWisataDipilih(selected.map((id) => `Wisata #${id}`));
        });

      // Delay agar halaman selesai render sebelum dialog muncul
      const timer = setTimeout(() => {
        setShowLocationChoice(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAutoLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("tidak_didukung");
      return;
    }
    setLocationStatus("memuat");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const gpsPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        // Tampilkan map dengan posisi GPS untuk konfirmasi
        setGpsInitialPos(gpsPos);
        setMapDialogTitle("Konfirmasi Lokasi GPS");
        setLocationMode("otomatis");
        setLocationStatus("belum");
        setShowMapDialog(true);
      },
      () => {
        setLocationStatus("gagal");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
  }, []);

  const handleMapSave = (loc) => {
    setUserLocation(loc);
    setLocationStatus("aktif");
    // Preserve locationMode set before opening dialog
    if (!locationMode) setLocationMode("manual");
    setShowMapDialog(false);
    setGpsInitialPos(null);
  };

  const handleMapBatal = () => {
    setShowMapDialog(false);
    setGpsInitialPos(null);
    setTimeout(() => setShowLocationChoice(true), 300);
  };

  const handleManualMap = () => {
    setShowLocationChoice(false);
    setGpsInitialPos(null);
    setMapDialogTitle("Pilih Lokasi Manual");
    setLocationMode("manual");
    setShowMapDialog(true);
  };

  const handleAHPComparisonChange = (pairKey, field, value) => {
    setPerbandinganAHP((prev) => {
      const current = prev[pairKey] || { moreImportant: null, intensity: null };
      const next = { ...current, [field]: value };
      if (field === "moreImportant" && value === "equal") {
        next.intensity = 1;
      }
      return { ...prev, [pairKey]: next };
    });
  };

  const handleSimpan = async () => {
    if (!userLocation) {
      setErrorMsg("Lokasi belum ditentukan. Mohon pilih lokasi terlebih dahulu.");
      return;
    }

    const belumDiisi = Object.keys(perbandinganAHP).filter((key) => {
      const pair = perbandinganAHP[key];
      return !pair || pair.moreImportant === null || pair.intensity === null;
    });
    if (belumDiisi.length > 0) {
      setErrorMsg("Mohon lengkapi semua perbandingan berpasangan AHP.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const selectedIds = getSelectedWisata();
      const res = await api.post("/rekomendasi/hitung", {
        perbandinganAHP,
        userLocation,
      });

      const hasilData = res.data?.data?.hasil_rekomendasi || [];
      const filtered = hasilData.filter((item) =>
        selectedIds.includes(item.id_alternatif)
      );
      const reranked = filtered.map((item, idx) => ({
        ...item,
        peringkat_ke: idx + 1,
      }));
      nav("/wisatawan/hasil", { state: { hasil: reranked } });
    } catch (err) {
      const pesan =
        err?.response?.data?.message || err?.message || "Gagal menghitung rekomendasi";
      setErrorMsg(pesan);
    } finally {
      setLoading(false);
    }
  };

  const locationSeverity =
    locationStatus === "aktif" ? "success" :
    locationStatus === "memuat" || locationStatus === "belum" ? "info" : "error";

  const locationText =
    locationStatus === "belum" ? "Menunggu pilihan metode lokasi..." :
    locationStatus === "memuat" ? "Sedang mendapatkan lokasi GPS..." :
    locationStatus === "aktif" && userLocation
      ? `Aktif - ${locationMode === "manual" ? "Manual (Peta)" : "Otomatis (GPS)"} (Lat: ${userLocation.latitude.toFixed(6)}, Lng: ${userLocation.longitude.toFixed(6)})`
      : locationStatus === "gagal"
        ? "Gagal mendapatkan lokasi GPS. Silakan coba lagi dengan metode manual."
        : "Browser Anda tidak mendukung Geolocation. Gunakan metode manual.";

  const pairwiseRows = [];
  let pairwiseCounter = 1;
  for (let i = 0; i < kriteriaList.length; i++) {
    for (let j = i + 1; j < kriteriaList.length; j++) {
      pairwiseRows.push({
        rowNo: pairwiseCounter++,
        kriteriaA: kriteriaList[i],
        kriteriaB: kriteriaList[j],
      });
    }
  }

  // Jika belum pilih wisata, tampilkan pesan
  if (belumPilihWisata) {
    return (
      <>
          <div className="mb-4">
            <div className="mb-2" style={{ fontSize: "36px", fontWeight: "bold", color: "var(--text-color)" }}>
              {formatTanggalIndonesia()}
            </div>
            <h2 className="text-2xl font-bold text-800 mt-0 mb-2">
              <i className="pi pi-sliders-h mr-2"></i>Masukan Perbandingan Kriteria AHP
            </h2>
            <hr className="border-top-1 border-300" />
          </div>
          <Card className="shadow-1">
            <div className="text-center p-5">
              <i className="pi pi-info-circle text-5xl text-primary mb-3" style={{ display: "block" }}></i>
              <h3 className="text-xl font-semibold text-700 mt-0 mb-2">
                Silakan pilih wisata di Dashboard
              </h3>
              <p className="text-500 mb-4">
                Anda harus memilih wisata yang diminati terlebih dahulu di halaman Dashboard sebelum mengisi preferensi.
              </p>
              <Button
                label="Kembali ke Dashboard"
                icon="pi pi-arrow-left"
                onClick={() => nav("/wisatawan/dashboard")}
              />
            </div>
          </Card>
        </>
    );
  }

  return (
    <>
        {/* Dialog Konfirmasi Kembali ke Dashboard */}
        <Dialog
          header="Konfirmasi"
          visible={showConfirmDashboard}
          onHide={() => setShowConfirmDashboard(false)}
          style={{ width: "400px", maxWidth: "95vw" }}
          modal
          footer={
            <div className="flex justify-content-end gap-2">
              <Button
                label="Batal"
                icon="pi pi-times"
                severity="secondary"
                text
                onClick={() => setShowConfirmDashboard(false)}
              />
              <Button
                label="OK"
                icon="pi pi-check"
                onClick={() => {
                  clearSelectedWisata();
                  nav("/wisatawan/dashboard");
                }}
              />
            </div>
          }
        >
          <div className="flex align-items-center gap-3">
            <i className="pi pi-exclamation-triangle text-3xl text-yellow-500"></i>
            <p className="text-700 m-0">Apakah Anda ingin memilih wisata yang berbeda? Data preferensi yang sudah diisi akan hilang.</p>
          </div>
        </Dialog>

        {/* Dialog Pilih Metode Lokasi */}
        <Dialog
          header="Pilih Metode Lokasi"
          visible={showLocationChoice}
          onHide={() => setShowLocationChoice(false)}
          style={{ width: "450px", maxWidth: "95vw" }}
          modal
          closable={false}
          footer={
            <div className="flex justify-content-end">
              <Button
                label="Batal"
                icon="pi pi-times"
                severity="secondary"
                text
                onClick={() => setShowLocationChoice(false)}
              />
            </div>
          }
        >
          <div className="text-center">
            <i className="pi pi-map-marker text-4xl text-primary mb-3" style={{ display: "block" }}></i>
            <p className="text-700 mb-4">Bagaimana Anda ingin menentukan lokasi?</p>
            <div className="flex flex-column gap-2">
              <Button
                label="Otomatis (GPS)"
                icon="pi pi-compass"
                className="w-full"
                onClick={() => {
                  setShowLocationChoice(false);
                  handleAutoLocation();
                }}
              />
              <Button
                label="Manual (Peta)"
                icon="pi pi-map"
                className="w-full"
                severity="info"
                outlined
                onClick={() => {
                  handleManualMap();
                }}
              />
            </div>
          </div>
        </Dialog>

        <div className="mb-4">
          <div className="mb-2" style={{ fontSize: "36px", fontWeight: "bold", color: "var(--text-color)" }}>
            {formatTanggalIndonesia()}
          </div>
          <h2 className="text-2xl font-bold text-800 mt-0 mb-2">
            <i className="pi pi-sliders-h mr-2"></i>Masukan Perbandingan Kriteria AHP
          </h2>
          <hr className="border-top-1 border-300" />
        </div>

        {/* Informasi Wisata yang Dipilih */}
        {namaWisataDipilih.length > 0 && (
          <Card className="mb-4 shadow-1">
            <div className="flex align-items-start gap-3">
              <i className="pi pi-check-circle text-2xl text-green-500 mt-1"></i>
              <div>
                <div className="font-bold mb-2">Wisata yang Anda Pilih ({namaWisataDipilih.length})</div>
                <div className="flex flex-wrap gap-2">
                  {namaWisataDipilih.map((nama, idx) => (
                    <Chip key={idx} label={nama} icon="pi pi-map-marker" className="text-sm" />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Status Lokasi */}
        <Card className="mb-4 shadow-1">
          <div className="flex align-items-center justify-content-between">
            <div className="flex align-items-center gap-3">
              <i className={`pi pi-map-marker text-2xl ${locationStatus === "aktif" ? "text-green-500" : "text-500"}`}></i>
              <div>
                <div className="font-bold mb-1">Status Lokasi</div>
                <Tag severity={locationSeverity} value={locationText} />
              </div>
            </div>
            <Button
              label="Ubah Lokasi"
              icon="pi pi-map"
              severity="info"
              size="small"
              outlined
              onClick={() => setShowLocationChoice(true)}
            />
          </div>
        </Card>

        {/* Tabel Perbandingan Kriteria AHP */}
        <Card className="mb-4 shadow-1">
          <h3 className="text-lg font-semibold text-700 mt-0 mb-3">
            Tentukan perbandingan berpasangan antar kriteria dengan skala AHP (1-9):
          </h3>

          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th className="border-1 border-300 p-3 text-left surface-100" style={{ width: "60px" }}>No</th>
                <th className="border-1 border-300 p-3 text-left surface-100">Kriteria A</th>
                <th className="border-1 border-300 p-3 text-left surface-100" style={{ width: "420px" }}>Perbandingan</th>
                <th className="border-1 border-300 p-3 text-left surface-100">Kriteria B</th>
              </tr>
            </thead>
            <tbody>
              {pairwiseRows.map(({ rowNo, kriteriaA, kriteriaB }, idx) => {
                  const pairKey = `${kriteriaA.id}-${kriteriaB.id}`;
                  const pair = perbandinganAHP[pairKey] || { moreImportant: null, intensity: null };
                  const moreImportantOptions = [
                    { value: kriteriaA.id, label: `${kriteriaA.nama} lebih penting` },
                    { value: "equal", label: "Keduanya sama penting" },
                    { value: kriteriaB.id, label: `${kriteriaB.nama} lebih penting` },
                  ];

                  return (
                    <tr key={pairKey} className={idx % 2 === 1 ? "surface-50" : ""}>
                      <td className="border-1 border-300 p-3">{rowNo}</td>
                      <td className="border-1 border-300 p-3">
                        <div className="font-medium">{kriteriaA.nama}</div>
                        <small className="text-600">{kriteriaA.deskripsi}</small>
                      </td>
                      <td className="border-1 border-300 p-3">
                        <div className="flex flex-column gap-2">
                          <Dropdown
                            value={pair.moreImportant}
                            options={moreImportantOptions}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => handleAHPComparisonChange(pairKey, "moreImportant", e.value)}
                            placeholder="-- Pilih mana yang lebih penting --"
                            className="w-full"
                          />
                          <Dropdown
                            value={pair.intensity}
                            options={BOBOT_OPTIONS}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => handleAHPComparisonChange(pairKey, "intensity", Number(e.value))}
                            placeholder="-- Pilih skala intensitas --"
                            className="w-full"
                            disabled={pair.moreImportant === null}
                          />
                        </div>
                      </td>
                      <td className="border-1 border-300 p-3">
                        <div className="font-medium">{kriteriaB.nama}</div>
                        <small className="text-600">{kriteriaB.deskripsi}</small>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </Card>

        {/* Pesan Error */}
        {errorMsg && (
          <Message severity="error" text={errorMsg} className="w-full mb-3" />
        )}

        {/* Tombol Simpan */}
        <div className="flex justify-content-center">
          <Button
            label={loading ? "Memproses..." : "Simpan & Lihat Hasil"}
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
            onClick={handleSimpan}
            disabled={loading}
            className="px-5"
          />
        </div>

        {/* Map Picker Dialog */}
        <MapPickerDialog
          visible={showMapDialog}
          onHide={handleMapBatal}
          onSave={handleMapSave}
          initialPosition={gpsInitialPos}
          headerTitle={mapDialogTitle}
        />
    </>
  );
}
