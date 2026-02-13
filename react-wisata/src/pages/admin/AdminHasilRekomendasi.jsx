import { useState, useEffect, useRef } from "react";
import "../dashboard.css";
import Sidebar from "../../components/Sidebar";
import { adminMenu } from "../../app/adminMenu";
import { getHasilRekomendasiGlobal } from "../../services/rekomendasi.service";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";

export default function AdminHasilRekomendasi() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getHasilRekomendasiGlobal();
      const list = res.data.data || [];
      setData(list.slice(0, 5));
    } catch (err) {
      console.error("Gagal mengambil data hasil rekomendasi:", err);
      setError("Gagal mengambil data hasil rekomendasi dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const rankingTemplate = (rowData) => {
    const rank = rowData.global_ranking;
    let severity = null;
    if (rank === 1) severity = "success";
    else if (rank <= 3) severity = "info";
    return <Tag value={`#${rank}`} severity={severity} />;
  };

  return (
    <div className="page">
      <Sidebar items={adminMenu} />

      <main className="content">
        <Toast ref={toast} />

        <h2 className="text-2xl font-bold text-800">
          Hasil Rekomendasi Wisata
        </h2>
        <hr className="border-top-1 border-300" />

        {error && (
          <Message severity="error" text={error} className="mb-3 w-full" />
        )}

        {loading ? (
          <div className="flex justify-content-center p-5">
            <ProgressSpinner />
          </div>
        ) : data.length === 0 ? (
          <Message
            severity="info"
            text="Belum ada data hasil rekomendasi. Data akan muncul setelah wisatawan melakukan perhitungan rekomendasi."
            className="w-full"
          />
        ) : (
          <>
            <Message
              severity="success"
              text="Berikut adalah 5 besar wisata berdasarkan rata-rata skor WP dari seluruh inputan wisatawan:"
              className="w-full mb-3"
            />

            <DataTable
              value={data}
              dataKey="global_ranking"
              stripedRows
              showGridlines
              responsiveLayout="scroll"
            >
              <Column
                header="Ranking"
                body={rankingTemplate}
                style={{ width: "100px" }}
              />
              <Column
                field="nama_wisata"
                header="Nama Wisata"
                sortable
              />
              <Column
                field="skor_rata_rata"
                header="Skor Akhir WP"
                sortable
                style={{ width: "150px" }}
              />
              <Column
                field="jumlah_direkomendasikan"
                header="Frekuensi"
                style={{ width: "130px" }}
              />
            </DataTable>
          </>
        )}
      </main>
    </div>
  );
}
