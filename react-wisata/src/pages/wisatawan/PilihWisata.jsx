import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../dashboard.css";
import Sidebar from "../../components/Sidebar";
import { wisatawanMenu } from "../../app/wisatawanMenu";
import { getSelectedWisata } from "../../store/wisataStore";
import api from "../../services/api";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Message } from "primereact/message";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import MapPickerDialog from "../../components/MapPickerDialog";

const KRITERIA_LIST = [
  { id: 1, nama: "Harga Tiket", deskripsi: "Seberapa penting harga tiket bagi Anda?" },
  { id: 2, nama: "Fasilitas", deskripsi: "Seberapa penting fasilitas wisata bagi Anda?" },
  { id: 3, nama: "Jarak", deskripsi: "Seberapa penting jarak dari lokasi Anda?" },
  { id: 4, nama: "Rating", deskripsi: "Seberapa penting rating Google Maps?" },
  { id: 5, nama: "Waktu Kunjungan", deskripsi: "Seberapa penting jam operasional wisata?" },
];

const BOBOT_OPTIONS = [
  { value: 1, label: "1 - Tidak Penting" },
  { value: 2, label: "2 - Kurang Penting" },
  { value: 3, label: "3 - Cukup Penting" },
  { value: 4, label: "4 - Penting" },
  { value: 5, label: "5 - Sangat Penting" },
];

export default function PilihWisata() {
  const nav = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("belum");
  const [locationMode, setLocationMode] = useState("");
  const [preferensi, setPreferensi] = useState({ 1: 3, 2: 3, 3: 3, 4: 3, 5: 3 });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [showLocationChoice, setShowLocationChoice] = useState(false);
  const [belumPilihWisata, setBelumPilihWisata] = useState(false);

  // Guard: tampilkan pesan jika belum memilih wisata di dashboard
  useEffect(() => {
    const selected = getSelectedWisata();
    if (!selected || selected.length === 0) {
      // setTimeout(0) diperlukan agar ESLint react-hooks/set-state-in-effect tidak error
      setTimeout(() => setBelumPilihWisata(true), 0);
    } else {
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
    setLocationMode("otomatis");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocationStatus("aktif");
      },
      () => {
        setLocationStatus("gagal");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, []);

  const handleMapSave = (loc) => {
    setUserLocation(loc);
    setLocationStatus("aktif");
    setLocationMode("manual");
    setShowMapDialog(false);
  };

  const handleMapBatal = () => {
    setShowMapDialog(false);
    setTimeout(() => setShowLocationChoice(true), 300);
  };

  const handleBobotChange = (kriteriaId, value) => {
    setPreferensi((prev) => ({ ...prev, [kriteriaId]: Number(value) }));
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

  const bobotTemplate = (rowData) => (
    <Dropdown
      value={preferensi[rowData.id]}
      options={BOBOT_OPTIONS}
      optionLabel="label"
      optionValue="value"
      onChange={(e) => handleBobotChange(rowData.id, e.value)}
      className="w-full"
    />
  );

  const nomorTemplate = (_rowData, options) => options.rowIndex + 1;

  // Jika belum pilih wisata, tampilkan pesan
  if (belumPilihWisata) {
    return (
      <div className="page">
        <Sidebar items={wisatawanMenu} />
        <main className="content">
          <div className="mb-4">
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
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <Sidebar items={wisatawanMenu} />

      <main className="content">
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
                  setShowLocationChoice(false);
                  setShowMapDialog(true);
                }}
              />
            </div>
          </div>
        </Dialog>

        <div className="mb-4">
          <h2 className="text-2xl font-bold text-800 mt-0 mb-2">
            <i className="pi pi-sliders-h mr-2"></i>Masukan Preferensi Wisata
          </h2>
          <hr className="border-top-1 border-300" />
        </div>

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

          <DataTable value={KRITERIA_LIST} stripedRows showGridlines>
            <Column header="No" body={nomorTemplate} style={{ width: "60px" }} />
            <Column field="nama" header="Kriteria" />
            <Column field="deskripsi" header="Keterangan" />
            <Column header="Bobot Kepentingan" body={bobotTemplate} style={{ width: "250px" }} />
          </DataTable>
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
        />
      </main>
    </div>
  );
}
