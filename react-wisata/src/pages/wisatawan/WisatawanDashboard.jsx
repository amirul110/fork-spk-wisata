import { useState } from "react";
import "../dashboard.css";
import Sidebar from "../../components/Sidebar";
import { wisatawanMenu } from "../../app/wisatawanMenu";

export default function WisatawanDashboard() {
  const [selected, setSelected] = useState([]);

  const toggle = (val) => {
    setSelected((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
  };

  const handleSave = () => {
    alert(`Tersimpan: ${selected.join(", ") || "-"}`);
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

        <div className="centerBox" style={{ marginTop: 12 }}>
          <div className="radioRow">
            {["Wisata 1", "Wisata 2", "Wisata 3", "Wisata 4"].map((w) => (
              <label key={w} style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}>
                <input
                  type="checkbox"
                  checked={selected.includes(w)}
                  onChange={() => toggle(w)}
                />
                {w}
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <button className="btn" onClick={handleSave}>Simpan</button>
        </div>
      </main>
    </div>
  );
}
