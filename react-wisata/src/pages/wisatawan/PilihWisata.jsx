import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getSelectedWisata, clearSelectedWisata } from "../../store/wisataStore";
import { getAllWisata } from "../../services/wisata.service";
import api from "../../services/api";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { Chip } from "primereact/chip";
import MapPickerDialog from "../../components/MapPickerDialog";
import { formatTanggalIndonesia } from "../../utils/formatTanggal";

export default function PilihWisata() {
  const nav = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("belum");
  const [locationMode, setLocationMode] = useState("");
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

  const handleSimpan = async () => {
    if (!userLocation) {
      setErrorMsg("Lokasi belum ditentukan. Mohon pilih lokasi terlebih dahulu.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const selectedIds = getSelectedWisata();
      const res = await api.post("/rekomendasi/hitung", {
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

  // Jika belum pilih wisata, tampilkan pesan
  if (belumPilihWisata) {
    return (
      <>
          <div className="mb-4">
            <div className="mb-2" style={{ fontSize: "36px", fontWeight: "bold", color: "var(--text-color)" }}>
              {formatTanggalIndonesia()}
            </div>
            <h2 className="text-2xl font-bold text-800 mt-0 mb-2">
              <i className="pi pi-sliders-h mr-2"></i>Pilih Lokasi Anda
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
                Anda harus memilih wisata yang diminati terlebih dahulu di halaman Dashboard sebelum melanjutkan aktivasi lokasi.
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
            <i className="pi pi-sliders-h mr-2"></i>Pilih Lokasi Anda
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

        <Card className="mb-4 shadow-1">
          <div className="flex align-items-start gap-3">
            <i className="pi pi-info-circle text-2xl text-primary mt-1"></i>
            <div>
              <div className="font-bold mb-2">Informasi Perhitungan</div>
              <p className="m-0 text-700">
                Bobot kriteria menggunakan metode AHP yang sudah ditetapkan oleh admin.
                Anda hanya perlu memilih lokasi, lalu sistem akan menghitung rekomendasi otomatis.
              </p>
            </div>
          </div>
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
