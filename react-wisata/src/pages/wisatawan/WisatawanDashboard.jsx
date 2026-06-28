import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllWisata } from "../../services/wisata.service";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";

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
      <div className="flex align-items-center justify-content-center surface-200" style={ { width: "100%", height: "150px" } }>
        <i className="pi pi-image text-400" style={ { fontSize: "2rem" } }></i>
      </div>
    );
  }

  const prev = (e) => { e.stopPropagation(); setIdx((i) => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setIdx((i) => (i + 1) % images.length); };

  return (
    <div className="relative overflow-hidden" style={ { width: "100%" } }>
      <img
        src={images[idx]}
        alt={`foto-${idx + 1}`}
        style={ { width: "100%", height: "auto", display: "block" } }
        onError={(e) => { e.target.style.display = "none"; }}
      />
      {images.length > 1 && (
        <>
          <Button icon="pi pi-chevron-left" rounded text onClick={prev}
            style={ { position: "absolute", top: "50%", left: "4px", transform: "translateY(-50%)", backgroundColor: "rgba(0,0,0,0.4)", color: "#fff", width: "2rem", height: "2rem" } } />
          <Button icon="pi pi-chevron-right" rounded text onClick={next}
            style={ { position: "absolute", top: "50%", right: "4px", transform: "translateY(-50%)", backgroundColor: "rgba(0,0,0,0.4)", color: "#fff", width: "2rem", height: "2rem" } } />
          <div style={ { position: "absolute", bottom: "6px", left: 0, right: 0, display: "flex", justifyContent: "center", gap: "4px" } }>
            {images.map((_, i) => (
              <span key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                style={ { width: "8px", height: "8px", borderRadius: "50%", cursor: "pointer", backgroundColor: i === idx ? "#0368ff" : "rgba(255,255,255,0.7)" } } />
            ))}
          </div>
          <span style={ { position: "absolute", top: "6px", right: "8px", backgroundColor: "rgba(0,0,0,0.5)", color: "#fff", fontSize: "0.7rem", padding: "1px 6px", borderRadius: "8px" } }>
            {idx + 1}/{images.length}
          </span>
        </>
      )}
    </div>
  );
}

// Daftar atraksi pakai penomoran 1,2,3 (ol). Ukuran = ukuran deskripsi (16px)
function AtraksiList({ atraksi }) {
  if (!atraksi) return <p className="m-0" style={ { fontSize: "16px", color: "#495057" } }>Belum ada data atraksi.</p>;
  const items = atraksi.split(",").map((s) => s.trim()).filter(Boolean);
  return (
    <ol className="m-0 pl-3 line-height-3" style={ { fontSize: "16px", color: "#495057" } }>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ol>
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
      {/* Header (tanpa tanggal/hari) */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-800 mt-0 mb-1">
          <i className="pi pi-compass mr-2 text-primary"></i>Informasi Destinasi Wisata Magetan
        </h2>
        <p className="text-600 mt-0 mb-3" style={ { fontSize: "20px" } }>
          Kenali setiap destinasi sebelum menentukan pilihan terbaik Anda.
        </p>
        <hr className="border-top-1 border-300" />
      </div>

      {/* Legenda — fontSize 20px, class text-sm dihapus agar benar-benar berubah */}
      <div className="flex gap-3 flex-wrap align-items-center mb-4 p-3 surface-50 border-round border-1 border-200" style={ { fontSize: "20px" } }>
        <span className="font-semibold text-600 mr-1">Keterangan:</span>
        <div className="flex align-items-center gap-1 text-600">
          <i className="pi pi-ticket text-blue-500"></i>
          <Tag severity="info" value="Rp xx.xxx" rounded style={ { fontSize: "20px" } } />
          <span>Harga tiket masuk</span>
        </div>
        <div className="flex align-items-center gap-1 text-600">
          <i className="pi pi-ticket text-green-500"></i>
          <Tag severity="success" value="Gratis" rounded style={ { fontSize: "20px" } } />
          <span>Tiket gratis</span>
        </div>
        <div className="flex align-items-center gap-1 text-600">
          <i className="pi pi-map-marker text-orange-500"></i>
          <Tag severity="warning" value="x.x km" rounded style={ { fontSize: "20px" } } />
          <span>Jarak dari Alun-Alun Magetan</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-content-center p-6">
          <ProgressSpinner style={ { width: "50px", height: "50px" } } />
        </div>
      ) : wisataList.length === 0 ? (
        <Message severity="warn" text="Data wisata tidak tersedia. Pastikan backend berjalan." className="w-full" />
      ) : (
        <div className="grid" style={ { alignItems: "stretch" } }>
          {wisataList.map((w) => {
            const jarak =
              w.latitude && w.longitude
                ? hitungJarak(MAGETAN_CENTER.lat, MAGETAN_CENTER.lng, w.latitude, w.longitude)
                : null;

            const gambarUrls = [];
            if (w.gambar_list && w.gambar_list.length > 0) {
              w.gambar_list.forEach((g) => gambarUrls.push(`${BACKEND_URL}/uploads/${g.nama_file}`));
            } else if (w.gambar) {
              gambarUrls.push(`${BACKEND_URL}/uploads/${w.gambar}`);
            }

            return (
              <div key={w.id_alternatif} className="col-12 md:col-6 lg:col-4 p-2">
                <div className="border-round-lg border-1 border-300 shadow-1 surface-card overflow-hidden flex flex-column" style={ { height: "100%" } }>

                  {/* Nama wisata — DI ATAS gambar, lebih besar dari konten (20px) */}
                  <h3 className="text-800 font-bold m-0 px-3 pt-3 pb-2" style={ { fontSize: "20px", lineHeight: 1.3 } }>
                    {w.nama_wisata}
                  </h3>

                  {/* Gambar — menempel ke tepi kartu */}
                  <ImageCarousel images={gambarUrls} />

                  {/* Konten — base 16px (lebih kecil dari nama) */}
                  <div className="p-3 flex flex-column gap-2 flex-grow-1" style={ { fontSize: "16px" } }>

                    {/* Harga & Jarak */}
                    <div className="flex gap-2 flex-wrap">
                      <Tag
                        icon="pi pi-ticket"
                        value={formatHarga(w.harga_tiket)}
                        severity={!w.harga_tiket || w.harga_tiket === 0 ? "success" : "info"}
                        rounded
                        style={ { fontSize: "16px" } }
                      />
                      {jarak && (
                        <Tag icon="pi pi-map-marker" value={`${jarak} km`} severity="warning" rounded style={ { fontSize: "16px" } } />
                      )}
                    </div>

                    <Divider className="my-1" />

                    {/* Atraksi — judul & isi tidak lebih kecil dari deskripsi (16px) */}
                    <div>
                      <p className="text-700 m-0 mb-1 uppercase font-semibold" style={ { fontSize: "16px" } }>
                        <i className="pi pi-star mr-1"></i>Atraksi
                      </p>
                      <AtraksiList atraksi={w.atraksi_wisata} />
                    </div>

                    <Divider className="my-1" />

                    {/* Deskripsi */}
                    <div>
                      <p className="text-700 m-0 mb-1 uppercase font-semibold" style={ { fontSize: "16px" } }>
                        <i className="pi pi-info-circle mr-1"></i>Deskripsi
                      </p>
                      <p className="text-600 m-0 line-height-3" style={ { fontSize: "16px" } }>
                        {w.deskripsi || "Deskripsi belum tersedia."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tombol lanjut ke halaman Pilih Kriteria */}
      {!loading && wisataList.length > 0 && (
        <div className="flex justify-content-center mt-4 mb-5">
          <Button
            label="Lanjut pilih kriteria"
            icon="pi pi-arrow-right"
            iconPos="right"
            onClick={() => nav("/wisatawan/pilih-kriteria")}
            style={ { backgroundColor: "#0368ff", border: "none", padding: "0.9rem 2.2rem", fontWeight: 600, fontSize: "1rem", borderRadius: "8px" } }
          />
        </div>
      )}
    </>
  );
}