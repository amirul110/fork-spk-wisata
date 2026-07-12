import { useState, useEffect, useRef } from "react";
import {
  getAllKriteria,
  getSubKriteriaByKriteria,
  createSubKriteria,
  updateSubKriteria,
  deleteSubKriteria,
} from "../../services/subkriteria.service";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";

const emptySubKriteria = {
  id_kriteria: null,
  code_kriteria: "",
  nama_sub_kriteria: "",
  nilai_bobot: null,
  batas_bawah: null,
  batas_atas: null,
};

export default function AdminSubKriteria() {
  const [kriteriaList, setKriteriaList] = useState([]);
  const [selectedKriteria, setSelectedKriteria] = useState(null);
  const [subKriteriaList, setSubKriteriaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSub, setLoadingSub] = useState(false);
  const [error, setError] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({ ...emptySubKriteria });
  const [submitted, setSubmitted] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const toast = useRef(null);

  const fetchKriteria = async () => {
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

  const fetchSubKriteria = async (idKriteria) => {
    setLoadingSub(true);
    setError(null);
    try {
      const res = await getSubKriteriaByKriteria(idKriteria);
      setSubKriteriaList(res.data.data.list_sub_kriteria || []);
    } catch (err) {
      console.error("Gagal mengambil data sub-kriteria:", err);
      setError("Gagal mengambil data sub-kriteria dari server.");
      setSubKriteriaList([]);
    } finally {
      setLoadingSub(false);
    }
  };

  useEffect(() => {
    fetchKriteria();
  }, []);

  const handleKriteriaChange = (e) => {
    const kriteria = e.value;
    setSelectedKriteria(kriteria);
    setSubKriteriaList([]);
    if (kriteria) {
      fetchSubKriteria(kriteria.id_kriteria);
    }
  };


  const openAddDialog = () => {
    if (!selectedKriteria) {
      toast.current.show({
        severity: "warn",
        summary: "Peringatan",
        detail: "Pilih kriteria terlebih dahulu",
        life: 3000,
      });
      return;
    }
    setForm({
      ...emptySubKriteria,
      id_kriteria: selectedKriteria.id_kriteria,
      code_kriteria: selectedKriteria.code_kriteria || `C${selectedKriteria.id_kriteria}`,
    });
    setIsEdit(false);
    setSubmitted(false);
    setDialogVisible(true);
  };

  const openEditDialog = (rowData) => {
    // No formatting needed - preserve values exactly as stored in database
    // This allows "09.00", "09.01", "24 jam" to display correctly
    setForm({
      ...rowData,
      batas_bawah: rowData.batas_bawah || '',
      batas_atas: rowData.batas_atas || ''
    });
    setIsEdit(true);
    setSubmitted(false);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setSubmitted(false);
  };

  const saveSubKriteria = async () => {
    setSubmitted(true);

    if (
      !form.nama_sub_kriteria?.trim() ||
      form.nilai_bobot === null ||
      form.nilai_bobot === undefined
    ) {
      return;
    }

    if (!isEdit && !form.id_kriteria) {
      return;
    }

    try {
      if (isEdit) {
        await updateSubKriteria(form.id_sub, {
          nama_sub_kriteria: form.nama_sub_kriteria,
          nilai_bobot: form.nilai_bobot,
          batas_bawah: form.batas_bawah,
          batas_atas: form.batas_atas,
        });
        toast.current.show({
          severity: "success",
          summary: "Berhasil",
          detail: "Data sub-kriteria berhasil diperbarui",
          life: 3000,
        });
      } else {
        await createSubKriteria({
          id_kriteria: form.id_kriteria,
          code_kriteria: form.code_kriteria,
          nama_sub_kriteria: form.nama_sub_kriteria,
          nilai_bobot: form.nilai_bobot,
          batas_bawah: form.batas_bawah,
          batas_atas: form.batas_atas,
        });
        toast.current.show({
          severity: "success",
          summary: "Berhasil",
          detail: "Data sub-kriteria berhasil ditambahkan",
          life: 3000,
        });
      }
      hideDialog();
      if (selectedKriteria) {
        fetchSubKriteria(selectedKriteria.id_kriteria);
      }
    } catch (err) {
      console.error("Gagal menyimpan sub-kriteria:", err);
      toast.current.show({
        severity: "error",
        summary: "Gagal",
        detail:
          err.response?.data?.message || "Gagal menyimpan data sub-kriteria",
        life: 4000,
      });
    }
  };

  const confirmDelete = (rowData) => {
    confirmDialog({
      message: `Apakah Anda yakin ingin menghapus sub-kriteria "${rowData.nama_sub_kriteria}"?`,
      header: "Konfirmasi Hapus",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Hapus",
      rejectLabel: "Batal",
      accept: async () => {
        try {
          await deleteSubKriteria(rowData.id_sub);
          toast.current.show({
            severity: "success",
            summary: "Berhasil",
            detail: "Data sub-kriteria berhasil dihapus",
            life: 3000,
          });
          if (selectedKriteria) {
            fetchSubKriteria(selectedKriteria.id_kriteria);
          }
        } catch (err) {
          console.error("Gagal menghapus sub-kriteria:", err);
          toast.current.show({
            severity: "error",
            summary: "Gagal",
            detail:
              err.response?.data?.message ||
              "Gagal menghapus data sub-kriteria",
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
          placeholder="Cari sub-kriteria..."
        />
      </span>
      <Button 
        label="Tambah Data" 
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
      <Button label="Simpan" icon="pi pi-check" onClick={saveSubKriteria} />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <h2 className="text-2xl font-bold text-800">
          Halaman Sub Kriteria
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
          <>
            <div className="mb-3 flex align-items-center gap-3">
              <label className="font-bold">Pilih Kriteria:</label>
              <Dropdown
                value={selectedKriteria}
                options={kriteriaList}
                onChange={handleKriteriaChange}
                optionLabel="nama_kriteria"
                placeholder="-- Pilih Kriteria --"
                style={{ minWidth: "250px" }}
              />
            </div>

            {selectedKriteria && (
              <>
                {loadingSub ? (
                  <div className="flex justify-content-center p-5">
                    <ProgressSpinner />
                  </div>
                ) : (
                  <DataTable
                    value={subKriteriaList}
                   
                    dataKey="id_sub"
                    globalFilter={globalFilter}
                    header={header}
                    emptyMessage="Data sub-kriteria tidak ditemukan."
                    responsiveLayout="scroll"
                  >
                    <Column
                      header="No"
                      body={rowNumberTemplate}
                      style={{ width: "60px" }}
                    />
                    <Column
                      field="nama_sub_kriteria"
                      header="Nama Sub Kriteria"
                      sortable
                    />
                    <Column
                      field="nilai_bobot"
                      header="Nilai Bobot"
                      sortable
                      style={{ width: "120px" }}
                    />
                    <Column
                      field="batas_bawah"
                      header="Batas Bawah"
                      sortable
                      style={{ width: "130px" }}
                    />
                    <Column
                      field="batas_atas"
                      header="Batas Atas"
                      sortable
                      style={{ width: "130px" }}
                    />
                    <Column
                      header="Aksi"
                      body={aksiTemplate}
                      style={{ width: "150px" }}
                    />
                  </DataTable>
                )}
              </>
            )}

            {!selectedKriteria && (
              <Message
                severity="info"
                text="Silakan pilih kriteria terlebih dahulu untuk melihat data sub-kriteria."
                className="w-full"
              />
            )}
          </>
        )}

        {/* Dialog Tambah/Edit */}
        <Dialog
          visible={dialogVisible}
          style={{ width: "450px" }}
          header={isEdit ? "Edit Sub Kriteria" : "Tambah Sub Kriteria"}
          modal
          className="p-fluid"
          footer={dialogFooter}
          onHide={hideDialog}
        >
          <div className="field mb-3">
            <label
              htmlFor="nama_sub_kriteria"
              className="font-bold mb-2 block"
            >
              Nama Sub Kriteria
            </label>
            <InputText
              id="nama_sub_kriteria"
              value={form.nama_sub_kriteria}
              onChange={(e) =>
                setForm({ ...form, nama_sub_kriteria: e.target.value })
              }
              className={
                submitted && !form.nama_sub_kriteria?.trim()
                  ? "p-invalid"
                  : ""
              }
            />
            {submitted && !form.nama_sub_kriteria?.trim() && (
              <small className="p-error">
                Nama Sub Kriteria wajib diisi.
              </small>
            )}
          </div>

          <div className="field mb-3">
            <label htmlFor="nilai_bobot" className="font-bold mb-2 block">
              Nilai Bobot
            </label>
            <InputNumber
              id="nilai_bobot"
              value={form.nilai_bobot}
              onValueChange={(e) =>
                setForm({ ...form, nilai_bobot: e.value })
              }
              min={1}
              className={
                submitted &&
                (form.nilai_bobot === null || form.nilai_bobot === undefined)
                  ? "p-invalid"
                  : ""
              }
            />
            {submitted &&
              (form.nilai_bobot === null ||
                form.nilai_bobot === undefined) && (
                <small className="p-error">Nilai Bobot wajib diisi.</small>
              )}
          </div>

          <div className="field mb-3">
            <label htmlFor="batas_bawah" className="font-bold mb-2 block">
              Batas Bawah
            </label>
            <InputText
              id="batas_bawah"
              value={form.batas_bawah || ''}
              onChange={(e) =>
                setForm({ ...form, batas_bawah: e.target.value })
              }
              placeholder="Contoh: 8.00, 17.00, 24, atau 24 jam"
            />
            <small className="text-500 block mt-1">
              Format: gunakan angka (misal: 8.00, 17.30, 24) atau teks seperti "24 jam"
            </small>
          </div>

          <div className="field mb-3">
            <label htmlFor="batas_atas" className="font-bold mb-2 block">
              Batas Atas
            </label>
            <InputText
              id="batas_atas"
              value={form.batas_atas || ''}
              onChange={(e) =>
                setForm({ ...form, batas_atas: e.target.value })
              }
              placeholder="Contoh: 12.00, 22.00, 24, atau 24 jam"
            />
            <small className="text-500 block mt-1">
              Format: gunakan angka (misal: 12.00, 22.00, 24) atau teks seperti "24 jam"
            </small>
          </div>
        </Dialog>
    </>
  );
}
