import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import "../dashboard.css";
import Sidebar from "../../components/Sidebar";
import { adminMenu } from "../../app/adminMenu";

import {
  getAllAlternatif,
  createAlternatif,
  updateAlternatif,
  deleteAlternatif,
} from "../../services/alternatif.service";

const emptyForm = {
  nama_wisata: "",
  latitude: null,
  longitude: null,
  rating_gmaps: null,
  harga_tiket: null,
  fasilitas: "",
  waktu_kunjungan: "",
};


export default function AdminAlternatif() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [first, setFirst] = useState(0);
  const toast = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllAlternatif();
      setData(res.data?.data || []);
      setError(null);
    } catch (err) {
      console.error("Gagal memuat data alternatif:", err);
      setError("Gagal memuat data. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openNew = () => {
    setForm({ ...emptyForm });
    setIsEdit(false);
    setEditId(null);
    setDialogVisible(true);
  };

  const openEdit = (rowData) => {
    setForm({
      nama_wisata: rowData.nama_wisata || "",
      latitude: rowData.latitude ?? null,
      longitude: rowData.longitude ?? null,
      rating_gmaps: rowData.rating_gmaps ?? null,
      harga_tiket: rowData.harga_tiket ?? null,
      fasilitas: rowData.fasilitas || "",
      waktu_kunjungan: rowData.waktu_kunjungan || "",
    });
    setIsEdit(true);
    setEditId(rowData.id_alternatif);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setForm({ ...emptyForm });
  };

  const saveData = async () => {
    if (!form.nama_wisata || form.latitude === null || form.latitude === undefined || form.longitude === null || form.longitude === undefined) {
      toast.current.show({
        severity: "warn",
        summary: "Peringatan",
        detail: "Nama, Latitude, dan Longitude wajib diisi!",
        life: 3000,
      });
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await updateAlternatif(editId, form);
        toast.current.show({
          severity: "success",
          summary: "Berhasil",
          detail: "Data wisata berhasil diupdate",
          life: 3000,
        });
      } else {
        await createAlternatif(form);
        toast.current.show({
          severity: "success",
          summary: "Berhasil",
          detail: "Data wisata berhasil ditambahkan",
          life: 3000,
        });
      }
      hideDialog();
      fetchData();
    } catch (err) {
      console.error("Gagal menyimpan data:", err);
      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail: err.response?.data?.message || "Terjadi kesalahan saat menyimpan data",
        life: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (rowData) => {
    confirmDialog({
      message: `Yakin ingin menghapus "${rowData.nama_wisata}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Hapus",
      rejectLabel: "Batal",
      accept: async () => {
        try {
          await deleteAlternatif(rowData.id_alternatif);
          toast.current.show({
            severity: "success",
            summary: "Berhasil",
            detail: "Data wisata berhasil dihapus",
            life: 3000,
          });
          fetchData();
        } catch (err) {
          console.error("Gagal menghapus data:", err);
          toast.current.show({
            severity: "error",
            summary: "Gagal",
            detail: "Terjadi kesalahan saat menghapus data",
            life: 3000,
          });
        }
      },
    });
  };

  const rowIndexTemplate = (_rowData, { rowIndex }) => first + rowIndex + 1;

  const actionTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        severity="warning"
        size="small"
        rounded
        outlined
        tooltip="Edit"
        tooltipOptions={{ position: "top" }}
        onClick={() => openEdit(rowData)}
      />
      <Button
        icon="pi pi-trash"
        severity="danger"
        size="small"
        rounded
        outlined
        tooltip="Hapus"
        tooltipOptions={{ position: "top" }}
        onClick={() => confirmDelete(rowData)}
      />
    </div>
  );

  const onInputChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button label="Batal" icon="pi pi-times" severity="secondary" outlined onClick={hideDialog} />
      <Button label="Simpan" icon="pi pi-check" loading={saving} onClick={saveData} />
    </div>
  );

  return (
    <div className="page">
      <Sidebar items={adminMenu} />
      <Toast ref={toast} />
      <ConfirmDialog />

      <main className="content">
        <h2 className="text-2xl font-bold text-800">Halaman Alternatif</h2>
        <hr className="border-top-1 border-300" />

        <div className="flex align-items-center gap-3 mb-3">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              placeholder="Cari wisata..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </span>
          <Button label="Tambah Data" icon="pi pi-plus" onClick={openNew} />
        </div>
   

       

        {loading ? (
          <div className="flex justify-content-center align-items-center py-6">
            <ProgressSpinner />
          </div>
        ) : error ? (
          <Message severity="error" text={error} className="w-full" />
        ) : (
          <DataTable
            value={data}
            stripedRows
            paginator
            rows={5}
            rowsPerPageOptions={[5, 10, 25]}
            first={first}
            onPage={(e) => setFirst(e.first)}
            globalFilter={globalFilter}
            emptyMessage="Tidak ada data wisata."
            size="small"
          >
            <Column header="No" body={rowIndexTemplate} style={{ width: "60px" }} />
            <Column field="nama_wisata" header="Nama Wisata" sortable />
            <Column field="latitude" header="Latitude" sortable />
            <Column field="longitude" header="Longitude" sortable />
            <Column field="rating_gmaps" header="Rating Gmaps" sortable />
            <Column field="harga_tiket" header="Harga Tiket" sortable />
            <Column field="fasilitas" header="Fasilitas" sortable />
            <Column field="waktu_kunjungan" header="Waktu Kunjungan" sortable />
            <Column header="Aksi" body={actionTemplate} style={{ width: "120px" }} />
          </DataTable>
        )}

        {/* Dialog Tambah / Edit */}
        <Dialog
          visible={dialogVisible}
          header={isEdit ? "Edit Data Wisata" : "Tambah Data Wisata"}
          style={{ width: "500px" }}
          modal
          onHide={hideDialog}
          footer={dialogFooter}
        >
          <div className="flex flex-column gap-3 pt-2">
            <div className="flex flex-column gap-1">
              <label className="font-semibold text-sm" htmlFor="nama_wisata">
                Nama Wisata <span className="text-red-500">*</span>
              </label>
              <InputText
                id="nama_wisata"
                value={form.nama_wisata}
                onChange={(e) => onInputChange("nama_wisata", e.target.value)}
                placeholder="Nama wisata"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex flex-column gap-1 flex-1">
                <label className="font-semibold text-sm" htmlFor="latitude">
                  Latitude <span className="text-red-500">*</span>
                </label>
                <InputNumber
                  id="latitude"
                  value={form.latitude}
                  onValueChange={(e) => onInputChange("latitude", e.value)}
                  mode="decimal"
                  minFractionDigits={1}
                  maxFractionDigits={10}
                  placeholder="Latitude"
                />
              </div>
              <div className="flex flex-column gap-1 flex-1">
                <label className="font-semibold text-sm" htmlFor="longitude">
                  Longitude <span className="text-red-500">*</span>
                </label>
                <InputNumber
                  id="longitude"
                  value={form.longitude}
                  onValueChange={(e) => onInputChange("longitude", e.value)}
                  mode="decimal"
                  minFractionDigits={1}
                  maxFractionDigits={10}
                  placeholder="Longitude"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-column gap-1 flex-1">
                <label className="font-semibold text-sm" htmlFor="rating_gmaps">Rating Gmaps</label>
                <InputNumber
                  id="rating_gmaps"
                  value={form.rating_gmaps}
                  onValueChange={(e) => onInputChange("rating_gmaps", e.value)}
                  mode="decimal"
                  minFractionDigits={1}
                  maxFractionDigits={1}
                  min={0}
                  max={5}
                  placeholder="0.0 - 5.0"
                />
              </div>
              <div className="flex flex-column gap-1 flex-1">
                <label className="font-semibold text-sm" htmlFor="harga_tiket">Harga Tiket</label>
                <InputNumber
                  id="harga_tiket"
                  value={form.harga_tiket}
                  onValueChange={(e) => onInputChange("harga_tiket", e.value)}
                  mode="decimal"
                  minFractionDigits={0}
                  maxFractionDigits={0}
                  min={0}
                  placeholder="Harga tiket"
                />
              </div>
            </div>
            <div className="flex flex-column gap-1">
              <label className="font-semibold text-sm" htmlFor="fasilitas">Fasilitas</label>
              <InputText
                id="fasilitas"
                value={form.fasilitas}
                onChange={(e) => onInputChange("fasilitas", e.target.value)}
                placeholder="Fasilitas"
              />
            </div>
            <div className="flex flex-column gap-1">
              <label className="font-semibold text-sm" htmlFor="waktu_kunjungan">Waktu Kunjungan</label>
              <InputText
                id="waktu_kunjungan"
                value={form.waktu_kunjungan}
                onChange={(e) => onInputChange("waktu_kunjungan", e.target.value)}
                placeholder="Contoh: 08.00 - 16.00"
              />
            </div>
          </div>
        </Dialog>
      </main>
    </div>
  );
}
