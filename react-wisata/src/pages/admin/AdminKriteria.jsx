import { useState, useEffect, useRef } from "react";
import "../dashboard.css";
import Sidebar from "../../components/Sidebar";
import { adminMenu } from "../../app/adminMenu";
import {
  getAllKriteria,
  createKriteria,
  updateKriteria,
  deleteKriteria,
} from "../../services/kriteria.service";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";

const jenisOptions = [
  { label: "Cost", value: "cost" },
  { label: "Benefit", value: "benefit" },
];

const emptyKriteria = {
  id_kriteria: "",
  nama_kriteria: "",
  bobot_prioritas: null,
  jenis: "",
  deskripsi: "",
};

export default function AdminKriteria() {
  const [kriteriaList, setKriteriaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({ ...emptyKriteria });
  const [submitted, setSubmitted] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllKriteria();
      setKriteriaList(res.data.data.list_kriteria || []);
    } catch (err) {
      console.error("Gagal mengambil data kriteria:", err);
      setError("Gagal mengambil data kriteria dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddDialog = () => {
    setForm({ ...emptyKriteria });
    setIsEdit(false);
    setSubmitted(false);
    setDialogVisible(true);
  };

  const openEditDialog = (rowData) => {
    setForm({ ...rowData });
    setIsEdit(true);
    setSubmitted(false);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setSubmitted(false);
  };

  const saveKriteria = async () => {
    setSubmitted(true);

    if (
      !form.nama_kriteria?.trim() ||
      !form.bobot_prioritas ||
      !form.jenis
    ) {
      return;
    }

    try {
      if (isEdit) {
        await updateKriteria(form.id_kriteria, {
          nama_kriteria: form.nama_kriteria,
          bobot_prioritas: form.bobot_prioritas,
          jenis: form.jenis,
          deskripsi: form.deskripsi,
        });
        toast.current.show({
          severity: "success",
          summary: "Berhasil",
          detail: "Data kriteria berhasil diperbarui",
          life: 3000,
        });
      } else {
        await createKriteria({
          nama_kriteria: form.nama_kriteria,
          bobot_prioritas: form.bobot_prioritas,
          jenis: form.jenis,
          deskripsi: form.deskripsi,
        });
        toast.current.show({
          severity: "success",
          summary: "Berhasil",
          detail: "Data kriteria berhasil ditambahkan",
          life: 3000,
        });
      }
      hideDialog();
      fetchData();
    } catch (err) {
      console.error("Gagal menyimpan kriteria:", err);
      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail: err.response?.data?.message || "Gagal menyimpan data kriteria",
        life: 4000,
      });
    }
  };

  const confirmDelete = (rowData) => {
    confirmDialog({
      message: `Apakah Anda yakin ingin menghapus kriteria "${rowData.nama_kriteria}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Hapus",
      rejectLabel: "Batal",
      accept: async () => {
        try {
          await deleteKriteria(rowData.id_kriteria);
          toast.current.show({
            severity: "success",
            summary: "Berhasil",
            detail: "Data kriteria berhasil dihapus",
            life: 3000,
          });
          fetchData();
        } catch (err) {
          console.error("Gagal menghapus kriteria:", err);
          toast.current.show({
            severity: "error",
            summary: "Gagal",
            detail:
              err.response?.data?.message || "Gagal menghapus data kriteria",
            life: 4000,
          });
        }
      },
    });
  };

  const rowNumberTemplate = (_rowData, options) => {
    return options.rowIndex + 1;
  };

  const jenisTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.jenis}
        severity={rowData.jenis === "benefit" ? "success" : "danger"}
      />
    );
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
          placeholder="Cari kriteria..."
        />
      </span>
      <Button 
        label="Tambah Kriteria" 
        icon="pi pi-plus" 
        onClick={openAddDialog}
      />
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
      <Button label="Simpan" icon="pi pi-check" onClick={saveKriteria} />
    </div>
  );

  return (
    <div className="page">
      <Sidebar items={adminMenu} />

      <main className="content">
        <Toast ref={toast} />
        <ConfirmDialog />

        <h2 className="text-2xl font-bold text-800">
          Halaman Kriteria dan Bobot
        </h2>
        <hr className="border-top-1 border-300" />

        {error && (
          <Message severity="error" text={error} className="mb-3 w-full" />
        )}

        {loading ? (
          <div className="flex justify-content-center p-5">
            <ProgressSpinner />
          </div>
        ) : (
          <DataTable
            value={kriteriaList}
            paginator
            rows={10}
            dataKey="id_kriteria"
            globalFilter={globalFilter}
            header={header}
            emptyMessage="Data kriteria tidak ditemukan."
            responsiveLayout="scroll"
          >
            <Column
              header="No"
              body={rowNumberTemplate}
              style={{ width: "60px" }}
            />
            <Column
              field="nama_kriteria"
              header="Nama Kriteria"
              sortable
            />
            <Column
              field="bobot_prioritas"
              header="Bobot"
              sortable
              style={{ width: "120px" }}
            />
            <Column
              field="jenis"
              header="Jenis"
              body={jenisTemplate}
              sortable
              style={{ width: "120px" }}
            />
            <Column
              field="deskripsi"
              header="Deskripsi"
              sortable
              style={{ width: "300px" }}
            />
            <Column
              header="Aksi"
              body={aksiTemplate}
              style={{ width: "150px" }}
            />
          </DataTable>
        )}

        {/* Dialog Tambah/Edit */}
        <Dialog
          visible={dialogVisible}
          style={{ width: "450px" }}
          header={isEdit ? "Edit Kriteria" : "Tambah Kriteria"}
          modal
          className="p-fluid"
          footer={dialogFooter}
          onHide={hideDialog}
        >
          <div className="field mb-3">
            <label htmlFor="nama_kriteria" className="font-bold mb-2 block">
              Nama Kriteria
            </label>
            <InputText
              id="nama_kriteria"
              value={form.nama_kriteria}
              onChange={(e) =>
                setForm({ ...form, nama_kriteria: e.target.value })
              }
              className={
                submitted && !form.nama_kriteria?.trim() ? "p-invalid" : ""
              }
            />
            {submitted && !form.nama_kriteria?.trim() && (
              <small className="p-error">Nama Kriteria wajib diisi.</small>
            )}
          </div>

          <div className="field mb-3">
            <label htmlFor="bobot_prioritas" className="font-bold mb-2 block">
              Bobot
            </label>
            <InputNumber
              id="bobot_prioritas"
              value={form.bobot_prioritas}
              onValueChange={(e) =>
                setForm({ ...form, bobot_prioritas: e.value })
              }
              mode="decimal"
              minFractionDigits={1}
              maxFractionDigits={2}
              min={0.01}
              max={1}
              className={
                submitted && !form.bobot_prioritas ? "p-invalid" : ""
              }
            />
            {submitted && !form.bobot_prioritas && (
              <small className="p-error">Bobot wajib diisi.</small>
            )}
          </div>

          <div className="field mb-3">
            <label htmlFor="jenis" className="font-bold mb-2 block">
              Jenis
            </label>
            <Dropdown
              id="jenis"
              value={form.jenis}
              options={jenisOptions}
              onChange={(e) => setForm({ ...form, jenis: e.value })}
              placeholder="Pilih Jenis"
              className={submitted && !form.jenis ? "p-invalid" : ""}
            />
            {submitted && !form.jenis && (
              <small className="p-error">Jenis wajib dipilih.</small>
            )}
          </div>

          <div className="field mb-3">
            <label htmlFor="deskripsi" className="font-bold mb-2 block">
              Deskripsi / Pertanyaan Preferensi
            </label>
            <InputTextarea
              id="deskripsi"
              value={form.deskripsi}
              onChange={(e) =>
                setForm({ ...form, deskripsi: e.target.value })
              }
              rows={3}
              placeholder="Contoh: Seberapa penting harga tiket bagi Anda?"
            />
          </div>
        </Dialog>
      </main>
    </div>
  );
}
