import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllWisata } from "../../services/wisata.service";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";
import { formatTanggalIndonesia } from "../../utils/formatTanggal";

const BACKEND_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1").replace("/api/v1", "");
const MAGETAN_CENTER = { lat: -7.6514, lng: 111.3292 };

function hitungJarak(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

function formatHarga(harga) {
  if (!harga || harga === 0) return "Gratis";
  return `Rp ${Number(harga).toLocaleString("id-ID")}`;
}

// Komponen carousel gambar sederhana
function ImageCarousel({ images }) {
  const [idx, setIdx] = useState(0);
  if (!images || images.length === 0) {
    return (
      <div className="flex align-items-center justify-content-center surface-200" style={{ height: "200px" }}>
        <i className="pi pi-image text-400" style={{ fontSize: "2.5rem" }}></i>
      </div>
    );
  }
  const prev = (e) => { e.stopPropagation(); setIdx((i) => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setIdx((i) => (i + 1) % images.length) % images.length; };

  return (
    <div className="relative overflow-hidden" style={{ height: "200px", background: "#e9ecef" }}>
      <img
        src={images[idx]}
        alt={`foto-${idx + 1}`}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        onError={(e) => { e.target.style.display = "none"; }}
      />
      {images.length > 1 && (
        <>
          <Button
            icon="pi pi-chevron-left"
            rounded text
            onClick={prev}
            style={{ position: "absolute", left: "4px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.45)", color: "#fff", width: "28px", height: "28px", padding: 0 }}
          />
          <Button
            icon="pi pi-chevron-right"
            rounded text
            onClick={next}
            style={{ position: "absolute", right: "4px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.45)", color: "#fff", width: "28px", height: "28px", padding: 0 }}
          />
          {/* Dot indicator */}
          <div style={{ position: "absolute", bottom: "6px", left: 0, right: 0, display: "flex", justifyContent: "center", gap: "4px" }}>
            {images.map((_, i) => (
              <span
                key={i}
                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                style={{
                  width: "7px", height: "7px", borderRadius: "50%", cursor: "pointer",
                  background: i === idx ? "#fff" : "rgba(255,255,255,0.5)",
                  border: "1px solid rgba(255,255,255,0.7)",
                  display: "inline-block",
                }}
              />
            ))}
          </div>
          {/* Counter */}
          <span style={{ position: "absolute", top: "6px", right: "6px", background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: "0.7rem", padding: "2px 6px", borderRadius: "10px" }}>
            {idx + 1}/{images.length}
          </span>
        </>
      )}
    </div>
  );
}

function AtraksiList({ atraksi }) {
  if (!atraksi) return <p className="text-sm text-500 m-0">Belum ada data atraksi.</p>;
  const items = atraksi.split(",").map((s) => s.trim()).filter(Boolean);
  return (
    <ul className="m-0 pl-3 line-height-3" style={{ fontSize: "0.82rem", color: "#495057" }}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function WisatawanDashboard() {
  const [wisataList, setWisataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  useEffect(() => {
    getAllWisata()
      .then((res) => setWisataList(res.data?.data?.list_wisata || []))
      .catch((err) => console.error("Gagal memuat wisata:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Header */}
      <div className="mb-4">
        <div className="mb-1" style={{ fontSize: "32px", fontWeight: "bold", color: "var(--text-color)" }}>
          {formatTanggalIndonesia()}
        </div>
        <h2 className="text-2xl font-bold text-800 mt-0 mb-1">
          <i className="pi pi-compass mr-2 text-primary"></i>Informasi Destinasi Wisata Magetan
        </h2>
        <p className="text-600 mt-0 mb-3" style={{ fontSize: "0.95rem" }}>
          Kenali setiap destinasi sebelum menentukan pilihan terbaik Anda.
        </p>
        <hr className="border-top-1 border-300" />
      </div>

      {/* Legenda */}
      <div className="flex gap-3 flex-wrap mb-4 p-3 surface-50 border-round border-1 border-200">
        <span className="text-sm font-semibold text-600 mr-1">Keterangan:</span>
        <div className="flex align-items-center gap-1 text-sm text-600">
          <i className="pi pi-ticket text-blue-500"></i>
          <Tag severity="info" value="Rp xx.xxx" rounded style={{ fontSize: "0.75rem" }} />
          <span>Harga tiket masuk</span>
        </div>
        <div className="flex align-items-center gap-1 text-sm text-600">
          <i className="pi pi-ticket text-green-500"></i>
          <Tag severity="success" value="Gratis" rounded style={{ fontSize: "0.75rem" }} />
          <span>Tiket gratis</span>
        </div>
        <div className="flex align-items-center gap-1 text-sm text-600">
          <i className="pi pi-map-marker text-orange-500"></i>
          <Tag severity="warning" value="x.x km" rounded style={{ fontSize: "0.75rem" }} />
          <span>Jarak dari Alun-Alun Magetan</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-content-center p-6">
          <ProgressSpinner style={{ width: "50px", height: "50px" }} />
        </div>
      ) : wisataList.length === 0 ? (
        <Message severity="warn" text="Data wisata tidak tersedia. Pastikan backend berjalan." className="w-full" />
      ) : (
        <div className="grid" style={{ alignItems: "stretch" }}>
          {wisataList.map((w) => {
            const jarak =
              w.latitude && w.longitude
                ? hitungJarak(MAGETAN_CENTER.lat, MAGETAN_CENTER.lng, w.latitude, w.longitude)
                : null;

            // Kumpulkan semua URL gambar: dari gambar_list (baru) + gambar utama (lama)
         const gambarUrls = []
if (w.gambar_dashboard_list && w.gambar_dashboard_list.length > 0) {
  w.gambar_dashboard_list.forEach((g) => gambarUrls.push(`${BACKEND_URL}/uploads/${g.nama_file}`))
} else if (w.gambar_list && w.gambar_list.length > 0) {
  w.gambar_list.forEach((g) => gambarUrls.push(`${BACKEND_URL}/uploads/${g.nama_file}`))
} else if (w.gambar) {
  gambarUrls.push(`${BACKEND_URL}/uploads/${w.gambar}`)
}
            return (
              <div key={w.id_alternatif} className="col-12 md:col-6 lg:col-4 p-2" style={{ display: "flex" }}>
                <div
                  className="border-round-lg border-1 border-300 shadow-1 surface-card overflow-hidden"
                  style={{ display: "flex", flexDirection: "column", width: "100%" }}
                >
                  {/* Carousel Gambar */}
                  <div style={{ flexShrink: 0 }}>
                    <ImageCarousel images={gambarUrls} />
                  </div>

                  {/* Konten — flex grow agar semua kartu sama tinggi dalam 1 baris */}
                  <div className="p-3" style={{ display: "flex", flexDirection: "column", flex: 1 }}>

                    {/* Nama — fixed height 2 baris */}
                    <h3
                      className="text-800 mt-0 mb-2"
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        lineHeight: "1.4",
                        height: "2.8em",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {w.nama_wisata}
                    </h3>

                    {/* Harga & Jarak — fixed height */}
                    <div className="flex gap-2 flex-wrap mb-2" style={{ minHeight: "28px" }}>
                      <Tag
                        icon="pi pi-ticket"
                        value={formatHarga(w.harga_tiket)}
                        severity={!w.harga_tiket || w.harga_tiket === 0 ? "success" : "info"}
                        rounded
                        style={{ fontSize: "0.75rem" }}
                      />
                      {jarak && (
                        <Tag
                          icon="pi pi-map-marker"
                          value={`${jarak} km`}
                          severity="warning"
                          rounded
                          style={{ fontSize: "0.75rem" }}
                          tooltip={`Jarak ${jarak} km dari Alun-Alun Magetan`}
                          tooltipOptions={{ position: "top" }}
                        />
                      )}
                    </div>

                    {/* Keterangan jarak */}
                    {jarak && (
                      <p className="text-400 mt-0 mb-2" style={{ fontSize: "0.72rem" }}>
                        <i className="pi pi-info-circle mr-1"></i>
                        {jarak} km dari Alun-Alun Magetan
                      </p>
                    )}

                    <Divider style={{ margin: "0.4rem 0" }} />

                    {/* Atraksi — label */}
                    <p
                      className="text-500 mt-0 mb-1 uppercase"
                      style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.04em", flexShrink: 0 }}
                    >
                      <i className="pi pi-star mr-1"></i>Atraksi &amp; Fasilitas
                    </p>

                    {/* Atraksi — list, bisa scroll jika terlalu panjang */}
                    <div style={{ flex: 1, overflowY: "auto", maxHeight: "120px" }}>
                      <AtraksiList atraksi={w.atraksi_wisata} />
                    </div>

                    <Divider style={{ margin: "0.4rem 0" }} />

                    {/* Deskripsi — selalu 3 baris */}
                    <p
                      className="text-500 mt-0 mb-1 uppercase"
                      style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.04em" }}
                    >
                      <i className="pi pi-info-circle mr-1"></i>Deskripsi
                    </p>
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
                      {w.deskripsi || "Deskripsi belum tersedia."}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tombol lanjut ke halaman Pilih Wisata */}
      {!loading && wisataList.length > 0 && (
        <div className="flex justify-content-center mt-4 mb-5">
          <Button
            label="Lanjut pilih wisata"
            icon="pi pi-arrow-right"
            iconPos="right"
            onClick={() => nav("/wisatawan/pilih-wisata")}
            style={ { backgroundColor: "#0368ff", border: "none", padding: "0.9rem 2.2rem", fontWeight: 600, fontSize: "1rem", borderRadius: "8px" } }
          />
        </div>
      )}
    </>
  );
}