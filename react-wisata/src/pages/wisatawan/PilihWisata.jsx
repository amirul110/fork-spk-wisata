import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../dashboard.css";
import Sidebar from "../../components/Sidebar";
import { wisatawanMenu } from "../../app/wisatawanMenu";
import api from "../../services/api";

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
  const [preferensi, setPreferensi] = useState({ 1: 3, 2: 3, 3: 3, 4: 3, 5: 3 });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const mintaLokasi = () => {
      if (!navigator.geolocation) {
        setLocationStatus("tidak_didukung");
        return;
      }

      const konfirmasi = window.confirm(
        "Aplikasi ini memerlukan akses lokasi GPS Anda untuk menghitung jarak ke tempat wisata.\n\nApakah Anda mengizinkan mengaktifkan GPS?"
      );

      if (!konfirmasi) {
        setLocationStatus("ditolak");
        return;
      }

      setLocationStatus("memuat");
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
    };

    setTimeout(mintaLokasi, 500);
  }, []);

  const handleBobotChange = (kriteriaId, value) => {
    setPreferensi((prev) => ({ ...prev, [kriteriaId]: Number(value) }));
  };

  const handleSimpan = async () => {
    if (!userLocation) {
      setErrorMsg("Lokasi GPS belum aktif. Mohon izinkan akses lokasi terlebih dahulu.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await api.post("/rekomendasi/hitung", {
        preferensi,
        userLocation,
      });

      const hasilData = res.data?.data?.hasil_rekomendasi || [];
      nav("/wisatawan/hasil", { state: { hasil: hasilData } });
    } catch (err) {
      const pesan =
        err?.response?.data?.message || err?.message || "Gagal menghitung rekomendasi";
      setErrorMsg(pesan);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Sidebar items={wisatawanMenu} />

      <main className="content">
        <h2>Masukan Preferensi Wisata</h2>
        <div className="hrline" />

        {/* Status Lokasi GPS */}
        <div style={{ marginBottom: 16, padding: "10px 14px", border: "2px solid #333", background: "#fafafa" }}>
          <strong>📍 Status Lokasi GPS:</strong>{" "}
          {locationStatus === "belum" && "Menunggu izin..."}
          {locationStatus === "memuat" && "Sedang mendapatkan lokasi..."}
          {locationStatus === "aktif" && (
            <span style={{ color: "#1f7a1f" }}>
              ✅ Aktif (Lat: {userLocation.latitude.toFixed(6)}, Lng: {userLocation.longitude.toFixed(6)})
            </span>
          )}
          {locationStatus === "ditolak" && (
            <span style={{ color: "#b00020" }}>❌ Anda menolak akses lokasi. Muat ulang halaman untuk mencoba lagi.</span>
          )}
          {locationStatus === "gagal" && (
            <span style={{ color: "#b00020" }}>❌ Gagal mendapatkan lokasi. Pastikan GPS aktif dan muat ulang halaman.</span>
          )}
          {locationStatus === "tidak_didukung" && (
            <span style={{ color: "#b00020" }}>❌ Browser Anda tidak mendukung Geolocation.</span>
          )}
        </div>

        {/* Tabel Preferensi Kriteria */}
        <p style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>
          Tentukan tingkat kepentingan untuk setiap kriteria berikut:
        </p>

        <table className="table">
          <thead>
            <tr>
              <th>No</th>
              <th>Kriteria</th>
              <th>Keterangan</th>
              <th>Bobot Kepentingan</th>
            </tr>
          </thead>
          <tbody>
            {KRITERIA_LIST.map((k, idx) => (
              <tr key={k.id}>
                <td>{idx + 1}</td>
                <td>{k.nama}</td>
                <td>{k.deskripsi}</td>
                <td>
                  <select
                    value={preferensi[k.id]}
                    onChange={(e) => handleBobotChange(k.id, e.target.value)}
                    style={{ padding: "4px 8px", fontWeight: 700 }}
                  >
                    {BOBOT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pesan Error */}
        {errorMsg && (
          <div style={{ marginTop: 12, color: "#b00020", fontWeight: 800, fontSize: 14 }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Tombol Simpan */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button className="btn" onClick={handleSimpan} disabled={loading}>
            {loading ? "Memproses..." : "Simpan & Lihat Hasil"}
          </button>
        </div>
      </main>
    </div>
  );
}
