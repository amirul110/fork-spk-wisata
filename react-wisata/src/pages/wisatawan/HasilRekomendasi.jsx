import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Message } from "primereact/message";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { formatTanggalIndonesia } from "../../utils/formatTanggal";

export default function HasilRekomendasi() {
  const location = useLocation();
  const nav = useNavigate();
  const hasil = location.state?.hasil || [];
  const [detailDialog, setDetailDialog] = useState(false);
  const [selectedWisata, setSelectedWisata] = useState(null);

  const hargaTemplate = (rowData) =>
    `Rp ${Number(rowData.harga_tiket).toLocaleString("id-ID")}`;

  const peringkatTemplate = (rowData) => (
    <Tag
      value={`#${rowData.peringkat_ke}`}
      severity={rowData.peringkat_ke === 1 ? "success" : rowData.peringkat_ke <= 3 ? "info" : null}
    />
  );

  const detailTemplate = (rowData) => (
    <Button
      icon="pi pi-info-circle"
      severity="info"
      size="small"
      rounded
      onClick={() => {
        setSelectedWisata(rowData);
        setDetailDialog(true);
      }}
      tooltip="Lihat Detail Wisata"
      tooltipOptions={{ position: "top" }}
    />
  );

  return (
    <>
        <div className="mb-4">
          <div className="mb-2" style={{ fontSize: "36px", fontWeight: "bold", color: "var(--text-color)" }}>
            {formatTanggalIndonesia()}
          </div>
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
                Belum ada data hasil rekomendasi. Silakan pilih wisata di Dashboard dan aktifkan lokasi terlebih dahulu.
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
              text="Berikut adalah hasil rekomendasi wisata menggunakan kombinasi metode AHP (bobot kriteria) dan SMART (nilai akhir alternatif):"
              className="w-full mb-4"
            />

            <Card className="shadow-2 mb-4">
              <DataTable value={hasil} stripedRows showGridlines responsiveLayout="scroll">
                <Column header="Peringkat" body={peringkatTemplate} style={{ width: "100px" }} />
                <Column field="nama_wisata" header="Nama Wisata" />
                <Column header="Harga Tiket" body={hargaTemplate} style={{ width: "150px" }} />
                <Column field="jarak_dari_anda" header="Jarak dari Anda" style={{ width: "150px" }} />
                <Column field="skor_rekomendasi" header="Skor Akhir SMART" style={{ width: "140px" }} />
                <Column header="Detail" body={detailTemplate} style={{ width: "80px" }} />
              </DataTable>
            </Card>

            <Dialog
              visible={detailDialog}
              header="Detail Informasi Wisata"
              modal
              style={{ width: "600px", maxWidth: "95vw" }}
              onHide={() => setDetailDialog(false)}
            >
              {selectedWisata && (
                <div className="flex flex-column gap-3">
                  <h3 className="text-xl font-bold text-800 mt-0 mb-2">
                    {selectedWisata.nama_wisata}
                  </h3>
                  <hr className="mt-0 mb-2" />
                  
                  <div className="grid">
                    <div className="col-12 md:col-6">
                      <div className="mb-3">
                        <span className="font-bold text-600 text-sm">Harga Tiket</span>
                        <div className="text-800 font-semibold mt-1">
                          Rp {Number(selectedWisata.harga_tiket).toLocaleString("id-ID")}
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-12 md:col-6">
                      <div className="mb-3">
                        <span className="font-bold text-600 text-sm">Rating Google Maps</span>
                        <div className="text-800 font-semibold mt-1">
                          <i className="pi pi-star-fill text-yellow-500 mr-1"></i>
                          {selectedWisata.rating_gmaps}
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-12 md:col-6">
                      <div className="mb-3">
                        <span className="font-bold text-600 text-sm">Jarak dari Anda</span>
                        <div className="text-800 font-semibold mt-1">
                          <i className="pi pi-map-marker text-red-500 mr-1"></i>
                          {selectedWisata.jarak_dari_anda}
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-12 md:col-6">
                      <div className="mb-3">
                        <span className="font-bold text-600 text-sm">Waktu Kunjungan</span>
                        <div className="text-800 font-semibold mt-1">
                          <i className="pi pi-clock text-blue-500 mr-1"></i>
                          {selectedWisata.waktu_kunjungan}
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <div className="mb-3">
                        <span className="font-bold text-600 text-sm">Atraksi Wisata</span>
                        <div className="text-800 mt-1">
                          {selectedWisata.atraksi_wisata || selectedWisata.fasilitas}
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <div className="mb-0">
                        <span className="font-bold text-600 text-sm">Skor Rekomendasi (SMART)</span>
                        <div className="text-800 font-semibold mt-1">
                          <Tag value={selectedWisata.skor_rekomendasi} severity="success" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Dialog>

            <div className="flex justify-content-center gap-3">
              <Button
                label="Pilih Wisata Lagi"
                icon="pi pi-arrow-left"
                severity="secondary"
                onClick={() => nav("/wisatawan/dashboard")}
              />
              <Button
                label="Aktifkan Lokasi Ulang"
                icon="pi pi-refresh"
                onClick={() => nav("/wisatawan/preferensi")}
              />
            </div>
          </>
        )}
    </>
  );
}
