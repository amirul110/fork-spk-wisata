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
  { value: 1, label: "1 - Tidak Penting" },
  { value: 2, label: "2 - Kurang Penting" },
  { value: 3, label: "3 - Cukup Penting" },
  { value: 4, label: "4 - Penting" },
  { value: 5, label: "5 - Sangat Penting" },
];

export default function PilihWisata() {
  const nav = useNavigate();
  const [kriteriaList, setKriteriaList] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("belum");
  const [locationMode, setLocationMode] = useState("");
  const [preferensi, setPreferensi] = useState({});
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
        
        // Initialize preferensi state
        const initialPreferensi = {};
        kriteriaData.forEach((k) => {
          initialPreferensi[k.id_kriteria] = null;
        });
        setPreferensi(initialPreferensi);
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

  const handleBobotChange = (kriteriaId, value) => {
    setPreferensi((prev) => ({ ...prev, [kriteriaId]: Number(value) }));
  };

  const handleSimpan = async () => {
    if (!userLocation) {
      setErrorMsg("Lokasi belum ditentukan. Mohon pilih lokasi terlebih dahulu.");
      return;
    }

    // Validasi semua bobot harus diisi
    const belumDiisi = kriteriaList.filter((k) => preferensi[k.id] === null);
    if (belumDiisi.length > 0) {
      setErrorMsg(`Mohon isi bobot untuk semua kriteria. Kriteria yang belum diisi: ${belumDiisi.map((k) => k.nama).join(", ")}`);
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const selectedIds = getSelectedWisata();
      const res = await api.post("/rekomendasi/hitung", {
        preferensi,
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

  // Handler sidebar navigation: intercept Dashboard click
  const handleSidebarClick = (item, e) => {
    if (item.path === "/wisatawan/dashboard") {
      e.preventDefault();
      setShowConfirmDashboard(true);
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

  // Jika belum pilih wisata, tampilkan pesan
  if (belumPilihWisata) {
    return (
      <>
          <div className="mb-4">
            <div className="mb-2" style={{ fontSize: "36px", fontWeight: "bold", color: "var(--text-color)" }}>
              {formatTanggalIndonesia()}
            </div>
            <h2 className="text-2xl font-bold text-800 mt-0 mb-2">
              <i className="pi pi-sliders-h mr-2"></i>Masukan Preferensi Wisata
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
            <i className="pi pi-sliders-h mr-2"></i>Masukan Preferensi Wisata
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

        {/* Tabel Preferensi Kriteria */}
        <Card className="mb-4 shadow-1">
          <h3 className="text-lg font-semibold text-700 mt-0 mb-3">
            Tentukan tingkat kepentingan untuk setiap kriteria:
          </h3>

          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th className="border-1 border-300 p-3 text-left surface-100" style={{ width: "60px" }}>No</th>
                <th className="border-1 border-300 p-3 text-left surface-100">Kriteria</th>
                <th className="border-1 border-300 p-3 text-left surface-100">Keterangan</th>
                <th className="border-1 border-300 p-3 text-left surface-100" style={{ width: "250px" }}>Bobot Kepentingan</th>
              </tr>
            </thead>
            <tbody>
              {kriteriaList.map((k, idx) => (
                <tr key={k.id} className={idx % 2 === 1 ? "surface-50" : ""}>
                  <td className="border-1 border-300 p-3">{idx + 1}</td>
                  <td className="border-1 border-300 p-3 font-medium">{k.nama}</td>
                  <td className="border-1 border-300 p-3 text-600">{k.deskripsi}</td>
                  <td className="border-1 border-300 p-3">
                    <Dropdown
                      value={preferensi[k.id]}
                      options={BOBOT_OPTIONS}
                      optionLabel="label"
                      optionValue="value"
                      onChange={(e) => handleBobotChange(k.id, e.value)}
                      placeholder="-- Pilih Bobot --"
                      className="w-full"
                    />
                  </td>
                </tr>
              ))}
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
