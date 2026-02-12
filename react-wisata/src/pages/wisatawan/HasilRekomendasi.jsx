import { useLocation, useNavigate } from "react-router-dom";
import "../dashboard.css";
import Sidebar from "../../components/Sidebar";
import { wisatawanMenu } from "../../app/wisatawanMenu";

export default function HasilRekomendasi() {
  const location = useLocation();
  const nav = useNavigate();
  const hasil = location.state?.hasil || [];

  return (
    <div className="page">
      <Sidebar items={wisatawanMenu} />

      <main className="content">
        <h2>Hasil Rekomendasi Wisata</h2>
        <div className="hrline" />

        {hasil.length === 0 ? (
          <div>
            <p style={{ fontWeight: 800, fontSize: 14 }}>
              Belum ada data hasil rekomendasi. Silakan isi preferensi terlebih dahulu.
            </p>
            <button className="btn" onClick={() => nav("/wisatawan/preferensi")}>
              Ke Halaman Preferensi
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>
              Berikut adalah hasil perhitungan rekomendasi wisata menggunakan metode Weighted Product (WP):
            </p>

            <table className="table">
              <thead>
                <tr>
                  <th>Peringkat</th>
                  <th>Nama Wisata</th>
                  <th>Rating GMaps</th>
                  <th>Harga Tiket</th>
                  <th>Jarak dari Anda</th>
                  <th>Skor Akhir WP</th>
                </tr>
              </thead>
              <tbody>
                {hasil.map((item) => (
                  <tr key={item.id_alternatif}>
                    <td>{item.peringkat_ke}</td>
                    <td>{item.nama_wisata}</td>
                    <td>{item.rating_gmaps}</td>
                    <td>Rp {Number(item.harga_tiket).toLocaleString("id-ID")}</td>
                    <td>{item.jarak_dari_anda}</td>
                    <td>{item.skor_rekomendasi}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <button className="btn" onClick={() => nav("/wisatawan/preferensi")}>
                Hitung Ulang
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
