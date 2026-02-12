import { useLocation, useNavigate } from "react-router-dom";
import "../dashboard.css";
import Sidebar from "../../components/Sidebar";
import { wisatawanMenu } from "../../app/wisatawanMenu";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Message } from "primereact/message";
import { Tag } from "primereact/tag";

export default function HasilRekomendasi() {
  const location = useLocation();
  const nav = useNavigate();
  const hasil = location.state?.hasil || [];

  const hargaTemplate = (rowData) =>
    `Rp ${Number(rowData.harga_tiket).toLocaleString("id-ID")}`;

  const ratingTemplate = (rowData) => (
    <div className="flex align-items-center gap-1">
      <i className="pi pi-star-fill text-yellow-500"></i>
      {rowData.rating_gmaps}
    </div>
  );

  const peringkatTemplate = (rowData) => (
    <Tag
      value={`#${rowData.peringkat_ke}`}
      severity={rowData.peringkat_ke === 1 ? "success" : rowData.peringkat_ke <= 3 ? "info" : null}
    />
  );

  return (
    <div className="page">
      <Sidebar items={wisatawanMenu} />

      <main className="content">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-800 mt-0 mb-2">
            <i className="pi pi-chart-bar mr-2"></i>Hasil Rekomendasi Wisata
          </h2>
          <hr className="border-top-1 border-300" />
        </div>

        {hasil.length === 0 ? (
          <Card className="shadow-1">
            <div className="text-center p-4">
              <i className="pi pi-info-circle text-4xl text-500 mb-3"></i>
              <p className="font-semibold text-700">
                Belum ada data hasil rekomendasi. Silakan pilih wisata di Dashboard dan isi preferensi terlebih dahulu.
              </p>
              <Button
                label="Ke Dashboard"
                icon="pi pi-arrow-left"
                onClick={() => nav("/wisatawan/dashboard")}
                className="mt-2"
              />
            </div>
          </Card>
        ) : (
          <>
            <Message
              severity="success"
              text="Berikut adalah hasil perhitungan rekomendasi wisata menggunakan metode Weighted Product (WP) berdasarkan wisata yang Anda pilih:"
              className="w-full mb-4"
            />

            <Card className="shadow-2 mb-4">
              <DataTable value={hasil} stripedRows showGridlines responsiveLayout="scroll">
                <Column header="Peringkat" body={peringkatTemplate} style={{ width: "100px" }} />
                <Column field="nama_wisata" header="Nama Wisata" />
                <Column header="Rating GMaps" body={ratingTemplate} style={{ width: "130px" }} />
                <Column header="Harga Tiket" body={hargaTemplate} style={{ width: "150px" }} />
                <Column field="jarak_dari_anda" header="Jarak dari Anda" style={{ width: "150px" }} />
                <Column field="skor_rekomendasi" header="Skor Akhir WP" style={{ width: "140px" }} />
              </DataTable>
            </Card>

            <div className="flex justify-content-center gap-3">
              <Button
                label="Pilih Wisata Lagi"
                icon="pi pi-arrow-left"
                severity="secondary"
                onClick={() => nav("/wisatawan/dashboard")}
              />
              <Button
                label="Hitung Ulang"
                icon="pi pi-refresh"
                onClick={() => nav("/wisatawan/preferensi")}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
