import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllWisata } from "../../services/wisata.service";
import { setSelectedWisata } from "../../store/wisataStore";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { formatTanggalIndonesia } from "../../utils/formatTanggal";

const BACKEND_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1").replace("/api/v1", "");

export default function PilihWisataPage() {
  const nav = useNavigate();
  const [wisataList, setWisataList] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    getAllWisata()
      .then((res) => setWisataList(res.data?.data?.list_wisata || []))
      .catch((err) => console.error("Gagal mengambil data wisata:", err))
      .finally(() => setLoadingData(false));
  }, []);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleLanjutkan = () => {
    if (selected.length < 2) return;
    setSelectedWisata(selected);
    nav("/wisatawan/preferensi");
  };

  return (
    <>
      <div className="mb-4">
        <div className="mb-1" style={{ fontSize: "32px", fontWeight: "bold", color: "var(--text-color)" }}>
          {formatTanggalIndonesia()}
        </div>
        <h2 className="text-2xl font-bold text-800 mt-0 mb-1">
          <i className="pi pi-check-square mr-2"></i>Pilih Wisata yang Diminati
        </h2>
        <p className="text-600 mt-0 mb-3" style={{ fontSize: "0.95rem" }}>
          Pilih minimal <strong>2 wisata</strong> yang ingin Anda bandingkan.
          Sudah melihat info setiap wisata di Dashboard? Gunakan itu sebagai pertimbangan.
        </p>
        <hr className="border-top-1 border-300" />
      </div>

      {loadingData ? (
        <div className="flex justify-content-center p-6">
          <ProgressSpinner style={{ width: "50px", height: "50px" }} />
        </div>
      ) : wisataList.length === 0 ? (
        <Message severity="warn" text="Data wisata tidak tersedia. Pastikan backend berjalan." className="w-full" />
      ) : (
        <div className="grid" style={{ alignItems: "stretch" }}>
          {wisataList.map((w) => (
            <div key={w.id_alternatif} className="col-12 md:col-6 lg:col-4 p-2" style={{ display: "flex" }}>
              <div
                className={`border-round-lg border-1 cursor-pointer transition-colors transition-duration-200 overflow-hidden shadow-1 ${
                  selected.includes(w.id_alternatif)
                    ? "border-primary bg-blue-50"
                    : "border-300 hover:border-primary"
                }`}
                style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}
                onClick={() => toggle(w.id_alternatif)}
              >
                {/* Judul + Checkbox */}
                <div
                  className="flex align-items-start justify-content-between p-3 border-bottom-1 border-200"
                  style={{ minHeight: "56px" }}
                >
                  <div
                    className="font-bold text-800"
                    style={{
                      fontSize: "0.9rem",
                      lineHeight: "1.3",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {w.nama_wisata}
                  </div>
                  <div className="ml-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.includes(w.id_alternatif)}
                      onChange={() => toggle(w.id_alternatif)}
                    />
                  </div>
                </div>

                {/* Gambar */}
                <div
                  className="surface-200 flex align-items-center justify-content-center"
                  style={{ height: "160px", overflow: "hidden" }}
                >
                  {w.gambar ? (
                    <img
                      src={`${BACKEND_URL}/uploads/${w.gambar}`}
                      alt={w.nama_wisata}
                      className="w-full h-full"
                      style={{ objectFit: "cover", display: "block" }}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <i className="pi pi-image text-400" style={{ fontSize: "2rem" }}></i>
                  )}
                </div>

                {/* Deskripsi singkat */}
                <div className="p-3" style={{ flex: 1 }}>
                  <p
                    className="text-600 mt-0 mb-0 line-height-3"
                    style={{
                      fontSize: "0.82rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {w.deskripsi || "Deskripsi wisata belum tersedia."}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected.length < 2 && !loadingData && wisataList.length > 0 && (
        <Message
          severity="info"
          text={`Pilih minimal 2 wisata. Saat ini sudah dipilih: ${selected.length}.`}
          className="w-full mt-3 mb-3"
        />
      )}

      <div className="flex justify-content-center mt-3">
        <Button
          label="Lanjutkan ke Aktivasi Lokasi"
          icon="pi pi-arrow-right"
          iconPos="right"
          onClick={handleLanjutkan}
          disabled={selected.length < 2}
          className="px-5"
        />
      </div>
    </>
  );
}