import { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import {
  getDashboardWisata,
  getDashboardKriteria,
} from "../../services/dashboard.service";

export default function AdminDashboard() {
  const [wisataList, setWisataList] = useState([]);
  const [kriteriaList, setKriteriaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wisataFirst, setWisataFirst] = useState(0);
  const [kriteriaFirst, setKriteriaFirst] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wisataRes, kriteriaRes] = await Promise.all([
          getDashboardWisata(),
          getDashboardKriteria(),
        ]);
        setWisataList(wisataRes.data?.data?.list_wisata || []);
        setKriteriaList(kriteriaRes.data?.data?.list_kriteria || []);
      } catch (err) {
        console.error("Gagal memuat data dashboard:", err);
        setError("Gagal memuat data dashboard. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const wisataRowIndex = (_rowData, { rowIndex }) => wisataFirst + rowIndex + 1;
  const kriteriaRowIndex = (_rowData, { rowIndex }) => kriteriaFirst + rowIndex + 1;

  const jenisTemplate = (rowData) => {
    const isCost = rowData.jenis?.toLowerCase() === "cost";
    return (
      <Tag
        value={rowData.jenis}
        severity={isCost ? "danger" : "success"}
      />
    );
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-800">
        Selamat datang di halaman dashboard
      </h2>
      <hr className="border-top-1 border-300" />

      {loading ? (
        <div className="flex justify-content-center align-items-center py-6">
          <ProgressSpinner />
        </div>
      ) : error ? (
        <Message severity="error" text={error} className="w-full" />
      ) : (
        <div className="flex flex-column gap-4">
          {/* Tabel Alternatif Wisata */}
          <div>
            <h3 className="text-xl font-semibold text-700 mb-3">
              Data Alternatif Wisata
            </h3>
            <DataTable
              value={wisataList}
              stripedRows
              paginator
              rows={5}
              rowsPerPageOptions={[5, 10, 25]}
              first={wisataFirst}
              onPage={(e) => setWisataFirst(e.first)}
              emptyMessage="Tidak ada data wisata."
              size="small"
            >
              <Column header="No" body={wisataRowIndex} style={{ width: "60px" }} />
              <Column field="nama_wisata" header="Nama Wisata" sortable />
            </DataTable>
          </div>

          {/* Tabel Kriteria */}
          <div>
            <h3 className="text-xl font-semibold text-700 mb-3">
              Data Kriteria
            </h3>
            <DataTable
              value={kriteriaList}
              stripedRows
              paginator
              rows={5}
              rowsPerPageOptions={[5, 10, 25]}
              first={kriteriaFirst}
              onPage={(e) => setKriteriaFirst(e.first)}
              emptyMessage="Tidak ada data kriteria."
              size="small"
            >
              <Column header="No" body={kriteriaRowIndex} style={{ width: "60px" }} />
              <Column field="nama_kriteria" header="Nama Kriteria" sortable />
              <Column header="Jenis" body={jenisTemplate} style={{ width: "120px" }} />
            </DataTable>
          </div>
        </div>
      )}
    </>
  );
}
