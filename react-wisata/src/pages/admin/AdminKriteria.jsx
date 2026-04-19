import { useState, useEffect, useRef } from "react";
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

const ahpScaleOptions = [
  { label: "1 - Sama penting", value: 1 },
  { label: "2 - Di antara 1 dan 3", value: 2 },
  { label: "3 - Sedikit lebih penting", value: 3 },
  { label: "4 - Di antara 3 dan 5", value: 4 },
  { label: "5 - Lebih penting", value: 5 },
  { label: "6 - Di antara 5 dan 7", value: 6 },
  { label: "7 - Jelas lebih penting", value: 7 },
  { label: "8 - Di antara 7 dan 9", value: 8 },
  { label: "9 - Mutlak lebih penting", value: 9 },
];

const AHP_RI = {
  1: 0.0, 2: 0.0, 3: 0.58, 4: 0.9, 5: 1.12,
  6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49,
  11: 1.51, 12: 1.48, 13: 1.56, 14: 1.57, 15: 1.59,
};

const emptyKriteria = {
  id_kriteria: "",
  nama_kriteria: "",
  bobot_prioritas: 0,
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
  const [ahpDialogVisible, setAhpDialogVisible] = useState(false);
  const [ahpPairwise, setAhpPairwise] = useState({});
  const [ahpError, setAhpError] = useState("");
  const [ahpCR, setAhpCR] = useState(null);
  const [savingAHP, setSavingAHP] = useState(false);
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
      !form.jenis
    ) {
      return;
    }

    try {
      if (isEdit) {
        await updateKriteria(form.id_kriteria, {
          nama_kriteria: form.nama_kriteria,
          bobot_prioritas: form.bobot_prioritas ?? 0,
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
          bobot_prioritas: form.bobot_prioritas ?? 0,
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

  const openAHPDialog = () => {
    const sorted = [...kriteriaList].sort((a, b) => Number(a.id_kriteria) - Number(b.id_kriteria));
    const initialPairs = {};
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        initialPairs[`${sorted[i].id_kriteria}-${sorted[j].id_kriteria}`] = {
          moreImportant: null,
          intensity: null,
        };
      }
    }
    setAhpPairwise(initialPairs);
    setAhpError("");
    setAhpCR(null);
    setAhpDialogVisible(true);
  };

  const setAHPPairValue = (pairKey, field, value) => {
    setAhpPairwise((prev) => {
      const curr = prev[pairKey] || { moreImportant: null, intensity: null };
      const next = { ...curr, [field]: value };
      if (field === "moreImportant" && value === "equal") next.intensity = 1;
      return { ...prev, [pairKey]: next };
    });
  };

  const saveAHPWeights = async () => {
    const sorted = [...kriteriaList].sort((a, b) => Number(a.id_kriteria) - Number(b.id_kriteria));
    const n = sorted.length;
    if (n < 2) {
      setAhpError("Minimal 2 kriteria diperlukan untuk perbandingan AHP.");
      return;
    }
    if (n > 15) {
      setAhpError("Jumlah kriteria maksimal 15 untuk perhitungan AHP.");
      return;
    }

    const matrix = Array.from({ length: n }, () => Array(n).fill(1));
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const idA = Number(sorted[i].id_kriteria);
        const idB = Number(sorted[j].id_kriteria);
        const pair = ahpPairwise[`${idA}-${idB}`];
        if (!pair || pair.moreImportant === null || pair.intensity === null) {
          setAhpError(`Perbandingan untuk pasangan ${sorted[i].nama_kriteria} vs ${sorted[j].nama_kriteria} belum lengkap.`);
          return;
        }
        const intensity = Number(pair.intensity);
        if (intensity < 1 || intensity > 9) {
          setAhpError("Nilai skala AHP harus 1 sampai 9.");
          return;
        }
        let aToB = 1;
        if (pair.moreImportant !== "equal") {
          aToB = Number(pair.moreImportant) === idA ? intensity : 1 / intensity;
        }
        matrix[i][j] = aToB;
        matrix[j][i] = 1 / aToB;
      }
    }

    const colSums = Array.from({ length: n }, (_, c) => matrix.reduce((s, r) => s + r[c], 0));
    const normalized = matrix.map((row) => row.map((value, c) => (colSums[c] === 0 ? 0 : value / colSums[c])));
    const weights = normalized.map((row) => row.reduce((s, v) => s + v, 0) / n);
    const weightedSums = matrix.map((row) => row.reduce((s, v, c) => s + (v * weights[c]), 0));
    const lambdaMax = weightedSums.reduce((s, val, i) => s + (weights[i] ? val / weights[i] : 0), 0) / n;
    const ci = n > 1 ? (lambdaMax - n) / (n - 1) : 0;
    const cr = (AHP_RI[n] || 0) === 0 ? 0 : ci / AHP_RI[n];
    setAhpCR(Number(cr.toFixed(4)));

    if (cr > 0.1) {
      setAhpError(`Rasio konsistensi (CR=${cr.toFixed(4)}) > 0.1. Mohon perbaiki perbandingan.`);
      return;
    }

    setSavingAHP(true);
    setAhpError("");
    try {
      await Promise.all(
        sorted.map((item, index) =>
          updateKriteria(item.id_kriteria, { bobot_prioritas: Number(weights[index].toFixed(6)) })
        )
      );
      toast.current.show({
        severity: "success",
        summary: "Berhasil",
        detail: "Bobot kriteria hasil AHP berhasil disimpan.",
        life: 3000,
      });
      setAhpDialogVisible(false);
      fetchData();
    } catch (err) {
      console.error("Gagal menyimpan bobot AHP:", err);
      setAhpError(err?.response?.data?.message || "Gagal menyimpan bobot hasil AHP.");
    } finally {
      setSavingAHP(false);
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
      <div className="flex gap-2">
        <Button
          label="Hitung Bobot AHP"
          icon="pi pi-calculator"
          severity="help"
          onClick={openAHPDialog}
          disabled={kriteriaList.length < 2}
        />
        <Button
          label="Tambah Kriteria"
          icon="pi pi-plus"
          onClick={openAddDialog}
        />
      </div>
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
    <>
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
              Bobot (opsional)
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
                submitted && form.bobot_prioritas < 0 ? "p-invalid" : ""
              }
            />
            <small className="text-600">
              Bobot utama disarankan dihitung dari tombol <b>Hitung Bobot AHP</b>.
            </small>
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

        <Dialog
          visible={ahpDialogVisible}
          style={{ width: "900px", maxWidth: "95vw" }}
          header="Perbandingan Berpasangan AHP (Admin)"
          modal
          className="p-fluid"
          onHide={() => setAhpDialogVisible(false)}
          footer={
            <div className="flex justify-content-end gap-2">
              <Button
                label="Batal"
                icon="pi pi-times"
                className="p-button-text"
                onClick={() => setAhpDialogVisible(false)}
                disabled={savingAHP}
              />
              <Button
                label={savingAHP ? "Menyimpan..." : "Hitung & Simpan Bobot"}
                icon={savingAHP ? "pi pi-spin pi-spinner" : "pi pi-check"}
                onClick={saveAHPWeights}
                disabled={savingAHP}
              />
            </div>
          }
        >
          <Message
            severity="info"
            text="Isi seluruh perbandingan antar kriteria dengan skala AHP 1-9. Bobot akan dihitung otomatis lalu disimpan ke bobot_prioritas."
            className="mb-3 w-full"
          />
          {ahpError && <Message severity="error" text={ahpError} className="mb-3 w-full" />}
          {ahpCR !== null && !ahpError && (
            <Message severity="success" text={`Rasio konsistensi (CR): ${ahpCR}`} className="mb-3 w-full" />
          )}
          <div style={{ maxHeight: "55vh", overflow: "auto" }}>
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th className="border-1 border-300 p-2 text-left surface-100">No</th>
                  <th className="border-1 border-300 p-2 text-left surface-100">Kriteria A</th>
                  <th className="border-1 border-300 p-2 text-left surface-100">Perbandingan</th>
                  <th className="border-1 border-300 p-2 text-left surface-100">Kriteria B</th>
                </tr>
              </thead>
              <tbody>
                {[...kriteriaList]
                  .sort((a, b) => Number(a.id_kriteria) - Number(b.id_kriteria))
                  .flatMap((kA, i, arr) =>
                    arr.slice(i + 1).map((kB, j) => {
                      const rowNo = ((i * (2 * arr.length - i - 1)) / 2) + j + 1;
                      const key = `${kA.id_kriteria}-${kB.id_kriteria}`;
                      const pair = ahpPairwise[key] || { moreImportant: null, intensity: null };
                      const whoOptions = [
                        { label: `${kA.nama_kriteria} lebih penting`, value: Number(kA.id_kriteria) },
                        { label: "Keduanya sama penting", value: "equal" },
                        { label: `${kB.nama_kriteria} lebih penting`, value: Number(kB.id_kriteria) },
                      ];
                      return (
                        <tr key={key} className={rowNo % 2 === 0 ? "surface-50" : ""}>
                          <td className="border-1 border-300 p-2">{rowNo}</td>
                          <td className="border-1 border-300 p-2">{kA.nama_kriteria}</td>
                          <td className="border-1 border-300 p-2">
                            <div className="flex flex-column gap-2">
                              <Dropdown
                                value={pair.moreImportant}
                                options={whoOptions}
                                optionLabel="label"
                                optionValue="value"
                                onChange={(e) => setAHPPairValue(key, "moreImportant", e.value)}
                                placeholder="Pilih arah kepentingan"
                              />
                              <Dropdown
                                value={pair.intensity}
                                options={ahpScaleOptions}
                                optionLabel="label"
                                optionValue="value"
                                onChange={(e) => setAHPPairValue(key, "intensity", Number(e.value))}
                                placeholder="Pilih skala 1-9"
                                disabled={pair.moreImportant === null}
                              />
                            </div>
                          </td>
                          <td className="border-1 border-300 p-2">{kB.nama_kriteria}</td>
                        </tr>
                      );
                    })
                  )}
              </tbody>
            </table>
          </div>
        </Dialog>
    </>
  );
}
