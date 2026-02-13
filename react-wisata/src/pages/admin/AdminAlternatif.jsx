import { useState, useEffect, useRef } from "react";
import "../dashboard.css";
import Sidebar from "../../components/Sidebar";
import { adminMenu } from "../../app/adminMenu";
import {
  getAllAlternatif,
  createAlternatif,
  updateAlternatif,
  deleteAlternatif,
} from "../../services/alternatif.service";

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

const emptyAlternatif = {
  nama_wisata: "",
  latitude: null,
  longitude: null,
  rating_gmaps: null,
  harga_tiket: null,
  fasilitas: "",
  waktu_kunjungan: "",
};

export default function AdminAlternatif() {
  const [alternatifList, setAlternatifList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyAlternatif });
  const [submitted, setSubmitted] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllAlternatif();
      setAlternatifList(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data alternatif:", err);
      setError("Gagal mengambil data alternatif dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddDialog = () => {
    setForm({ ...emptyAlternatif });
    setIsEdit(false);
    setEditId(null);
    setSubmitted(false);
    setDialogVisible(true);
  };

  const openEditDialog = (rowData) => {
    setForm({
      nama_wisata: rowData.nama_wisata || "",
      latitude: rowData.latitude,
      longitude: rowData.longitude,
      rating_gmaps: rowData.rating_gmaps,
      harga_tiket: rowData.harga_tiket,
      fasilitas: rowData.fasilitas || "",
      waktu_kunjungan: rowData.waktu_kunjungan || "",
    });
    setIsEdit(true);
    setEditId(rowData.id_alternatif);
    setSubmitted(false);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setSubmitted(false);
  };

  const saveAlternatif = async () => {
    setSubmitted(true);

    if (!form.nama_wisata?.trim() || form.latitude === null || form.longitude === null) {
      return;
    }

    try {
      if (isEdit) {
        await updateAlternatif(editId, form);
        toast.current.show({
          severity: "success",
          summary: "Berhasil",
          detail: "Data alternatif berhasil diperbarui",
          life: 3000,
        });
      } else {
        await createAlternatif(form);
        toast.current.show({
          severity: "success",
          summary: "Berhasil",
          detail: "Data alternatif berhasil ditambahkan",
          life: 3000,
        });
      }
      hideDialog();
      fetchData();
    } catch (err) {
      console.error("Gagal menyimpan alternatif:", err);
      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail: err.response?.data?.message || "Gagal menyimpan data alternatif",
        life: 4000,
      });
    }
  };

  const confirmDelete = (rowData) => {
    confirmDialog({
      message: `Apakah Anda yakin ingin menghapus "${rowData.nama_wisata}"?`,
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
            detail: "Data alternatif berhasil dihapus",
            life: 3000,
          });
          fetchData();
        } catch (err) {
          console.error("Gagal menghapus alternatif:", err);
          toast.current.show({
            severity: "error",
            summary: "Gagal",
            detail: err.response?.data?.message || "Gagal menghapus data alternatif",
            life: 4000,
          });
        }
      },
    });
  };

  const rowNumberTemplate = (_rowData, options) => {
    return options.rowIndex + 1;
  };

  const aksiTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-info p-button-sm"
          tooltip="Edit"
          tooltipOptions={{ position: "top" }}
          onClick={() => openEditDialog(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          tooltip="Hapus"
          tooltipOptions={{ position: "top" }}
          onClick={() => confirmDelete(rowData)}
        />
      </div>
    );
  };

  const header = (
    <div className="flex justify-content-between align-items-center">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Cari wisata..."
        />
      </span>
    </div>
  );

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Batal"
        icon="pi pi-times"
        className="p-button-text"
        onClick={hideDialog}
      />
      <Button label="Simpan" icon="pi pi-check" onClick={saveAlternatif} />
    </div>
  );

  return (
    <div className="page">
      <Sidebar items={adminMenu} />

      <main className="content">
        <Toast ref={toast} />
        <ConfirmDialog />

        <h2 className="text-2xl font-bold text-800">
          Halaman Alternatif
        </h2>
        <hr className="border-top-1 border-300" />

        {error && (
          <Message severity="error" text={error} className="mb-3 w-full" />
        )}

        <div className="mb-3">
          <Button
            label="Tambah Data"
            icon="pi pi-plus"
            onClick={openAddDialog}
          />
        </div>

        {loading ? (
          <div className="flex justify-content-center p-5">
            <ProgressSpinner />
          </div>
        ) : (
          <DataTable
            value={alternatifList}
            paginator
            rows={10}
            dataKey="id_alternatif"
            globalFilter={globalFilter}
            header={header}
            emptyMessage="Data alternatif tidak ditemukan."
            responsiveLayout="scroll"
          >
            <Column
              header="No"
              body={rowNumberTemplate}
              style={{ width: "60px" }}
            />
            <Column field="nama_wisata" header="Nama Wisata" sortable />
            <Column field="latitude" header="Latitude" sortable style={{ width: "120px" }} />
            <Column field="longitude" header="Longitude" sortable style={{ width: "120px" }} />
            <Column field="rating_gmaps" header="Rating" sortable style={{ width: "90px" }} />
            <Column field="harga_tiket" header="Harga Tiket" sortable style={{ width: "120px" }} />
            <Column field="fasilitas" header="Fasilitas" sortable />
            <Column field="waktu_kunjungan" header="Waktu Kunjungan" sortable style={{ width: "150px" }} />
            <Column
              header="Aksi"
              body={aksiTemplate}
              style={{ width: "120px" }}
            />
          </DataTable>
        )}

        {/* Dialog Tambah/Edit */}
        <Dialog
          visible={dialogVisible}
          style={{ width: "500px" }}
          header={isEdit ? "Edit Alternatif" : "Tambah Alternatif"}
          modal
          className="p-fluid"
          footer={dialogFooter}
          onHide={hideDialog}
        >
          <div className="field mb-3">
            <label htmlFor="nama_wisata" className="font-bold mb-2 block">
              Nama Wisata
            </label>
            <InputText
              id="nama_wisata"
              value={form.nama_wisata}
              onChange={(e) => setForm({ ...form, nama_wisata: e.target.value })}
              className={submitted && !form.nama_wisata?.trim() ? "p-invalid" : ""}
            />
            {submitted && !form.nama_wisata?.trim() && (
              <small className="p-error">Nama Wisata wajib diisi.</small>
            )}
          </div>

          <div className="field mb-3">
            <label htmlFor="latitude" className="font-bold mb-2 block">
              Latitude
            </label>
            <InputNumber
              id="latitude"
              value={form.latitude}
              onValueChange={(e) => setForm({ ...form, latitude: e.value })}
              mode="decimal"
              minFractionDigits={1}
              maxFractionDigits={10}
              className={submitted && form.latitude === null ? "p-invalid" : ""}
            />
            {submitted && form.latitude === null && (
              <small className="p-error">Latitude wajib diisi.</small>
            )}
          </div>

          <div className="field mb-3">
            <label htmlFor="longitude" className="font-bold mb-2 block">
              Longitude
            </label>
            <InputNumber
              id="longitude"
              value={form.longitude}
              onValueChange={(e) => setForm({ ...form, longitude: e.value })}
              mode="decimal"
              minFractionDigits={1}
              maxFractionDigits={10}
              className={submitted && form.longitude === null ? "p-invalid" : ""}
            />
            {submitted && form.longitude === null && (
              <small className="p-error">Longitude wajib diisi.</small>
            )}
          </div>

          <div className="field mb-3">
            <label htmlFor="rating_gmaps" className="font-bold mb-2 block">
              Rating Gmaps
            </label>
            <InputNumber
              id="rating_gmaps"
              value={form.rating_gmaps}
              onValueChange={(e) => setForm({ ...form, rating_gmaps: e.value })}
              mode="decimal"
              minFractionDigits={1}
              maxFractionDigits={1}
              min={0}
              max={5}
            />
          </div>

          <div className="field mb-3">
            <label htmlFor="harga_tiket" className="font-bold mb-2 block">
              Harga Tiket
            </label>
            <InputNumber
              id="harga_tiket"
              value={form.harga_tiket}
              onValueChange={(e) => setForm({ ...form, harga_tiket: e.value })}
              min={0}
            />
          </div>

          <div className="field mb-3">
            <label htmlFor="fasilitas" className="font-bold mb-2 block">
              Fasilitas
            </label>
            <InputText
              id="fasilitas"
              value={form.fasilitas}
              onChange={(e) => setForm({ ...form, fasilitas: e.target.value })}
            />
          </div>

          <div className="field mb-3">
            <label htmlFor="waktu_kunjungan" className="font-bold mb-2 block">
              Waktu Kunjungan
            </label>
            <InputText
              id="waktu_kunjungan"
              value={form.waktu_kunjungan}
              onChange={(e) => setForm({ ...form, waktu_kunjungan: e.target.value })}
            />
          </div>
        </Dialog>
      </main>
    </div>
  );
}
