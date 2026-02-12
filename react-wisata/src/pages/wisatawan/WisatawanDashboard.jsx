import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../dashboard.css";
import Sidebar from "../../components/Sidebar";
import { wisatawanMenu } from "../../app/wisatawanMenu";
import { getAllWisata } from "../../services/wisata.service";

export default function WisatawanDashboard() {
  const nav = useNavigate();
  const [wisataList, setWisataList] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllWisata();
        const data = res.data?.data?.list_wisata || [];
        setWisataList(data);
      } catch (err) {
        console.error("Gagal mengambil data wisata:", err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    nav("/wisatawan/preferensi");
  };

  return (
    <div className="page">
      <Sidebar items={wisatawanMenu} />

      <main className="content">
        <h2>Halaman Dashboard</h2>
        <div className="hrline" />

        <div style={{ marginTop: 10, fontWeight: 800, fontSize: 14 }}>
          Memilih Wisata yang diminati
        </div>

        {loadingData ? (
          <p style={{ marginTop: 12, fontSize: 14 }}>Memuat data wisata...</p>
        ) : wisataList.length === 0 ? (
          <p style={{ marginTop: 12, fontSize: 14 }}>Data wisata tidak tersedia.</p>
        ) : (
          <div className="centerBox" style={{ marginTop: 12 }}>
            <div className="radioRow">
              {wisataList.map((w) => (
                <label
                  key={w.id_alternatif}
                  style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(w.id_alternatif)}
                    onChange={() => toggle(w.id_alternatif)}
                  />
                  {w.nama_wisata}
                </label>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center" }}>
          <button className="btn" onClick={handleSave}>Simpan</button>
        </div>
      </main>
    </div>
  );
}
