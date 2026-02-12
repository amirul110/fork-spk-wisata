import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../dashboard.css";
import Sidebar from "../../components/Sidebar";
import { wisatawanMenu } from "../../app/wisatawanMenu";
import { getAllWisata } from "../../services/wisata.service";
import { setSelectedWisata } from "../../store/wisataStore";
import { Card } from "primereact/card";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";

const BACKEND_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1").replace("/api/v1", "");

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
    if (selected.length === 0) {
      return;
    }
    setSelectedWisata(selected);
    nav("/wisatawan/preferensi");
  };

  return (
    <div className="page">
      <Sidebar items={wisatawanMenu} />

      <main className="content">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-800 mt-0 mb-2">
            <i className="pi pi-home mr-2"></i>Halaman Dashboard
          </h2>
          <hr className="border-top-1 border-300" />
        </div>

        <Card className="mb-4 shadow-2">
          <h3 className="text-lg font-semibold text-700 mt-0 mb-3">
            <i className="pi pi-map-marker mr-2 text-primary"></i>
            Pilih Wisata yang Diminati
          </h3>

          {loadingData ? (
            <div className="flex justify-content-center p-4">
              <ProgressSpinner style={{ width: "50px", height: "50px" }} />
            </div>
          ) : wisataList.length === 0 ? (
            <Message
              severity="warn"
              text="Data wisata tidak tersedia. Pastikan backend berjalan."
              className="w-full"
            />
          ) : (
            <div className="grid">
              {wisataList.map((w) => (
                <div key={w.id_alternatif} className="col-12 md:col-6 lg:col-4 xl:col-3">
                  <div
                    className={`border-round border-1 cursor-pointer transition-colors transition-duration-200 overflow-hidden h-full flex flex-column ${
                      selected.includes(w.id_alternatif)
                        ? "border-primary bg-blue-50"
                        : "border-300 hover:border-primary"
                    }`}
                    onClick={() => toggle(w.id_alternatif)}
                  >
                    {/* Gambar wisata */}
                    <div className="relative surface-200 flex align-items-center justify-content-center" style={{ height: "160px", overflow: "hidden" }}>
                      {w.gambar ? (
                        <img
                          src={`${BACKEND_URL}/uploads/${w.gambar}`}
                          alt={w.nama_wisata}
                          className="w-full h-full"
                          style={{ objectFit: "cover", display: "block" }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : null}
                      <i className="pi pi-image text-400" style={{ fontSize: "2.5rem", position: "absolute", zIndex: 0 }}></i>
                      {/* Checkbox di pojok kanan atas */}
                      <div
                        className="absolute"
                        style={{ top: "8px", right: "8px", zIndex: 1 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selected.includes(w.id_alternatif)}
                          onChange={() => toggle(w.id_alternatif)}
                          className="p-checkbox-lg"
                        />
                      </div>
                    </div>

                    {/* Info wisata */}
                    <div className="p-3 flex-1 flex flex-column">
                      <div className="font-bold text-800 mb-2">{w.nama_wisata}</div>
                      {w.deskripsi && (
                        <p className="text-sm text-600 mt-0 mb-0 line-height-3" style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}>
                          {w.deskripsi}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {selected.length === 0 && !loadingData && wisataList.length > 0 && (
          <Message
            severity="info"
            text="Silakan pilih minimal 1 wisata terlebih dahulu sebelum melanjutkan."
            className="w-full mb-3"
          />
        )}

        <div className="flex justify-content-center">
          <Button
            label="Simpan & Lanjutkan"
            icon="pi pi-arrow-right"
            iconPos="right"
            onClick={handleSave}
            disabled={selected.length === 0}
            className="px-5"
          />
        </div>
      </main>
    </div>
  );
}
