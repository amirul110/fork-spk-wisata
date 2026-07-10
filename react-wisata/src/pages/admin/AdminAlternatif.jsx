import { useState, useEffect, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { InputTextarea } from 'primereact/inputtextarea'
import { FileUpload } from 'primereact/fileupload'
import { Image } from 'primereact/image'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'
import { getAllAlternatif, createAlternatif, updateAlternatif, deleteAlternatif } from '../../services/alternatif.service'
import api from '../../services/api'

const BACKEND_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '')

const emptyForm = {
  nama_wisata: '',
  latitude: null,
  longitude: null,
  rating_gmaps: null,
  harga_tiket: null,
  atraksi_wisata: '',
  deskripsi: '',
  gambar: null,
  gambar_list: [],
}

const getHargaSubKriteria = (harga) => {
  if (!harga || harga <= 0) return { category: '-', bobot: 0 }
  if (harga <= 20000) return { category: 'Sangat Murah (< 20rb)', bobot: 1 }
  if (harga <= 50000) return { category: 'Murah (20rb - 50rb)', bobot: 2 }
  if (harga <= 100000) return { category: 'Sedang (50rb - 100rb)', bobot: 3 }
  if (harga <= 200000) return { category: 'Mahal (100rb - 200rb)', bobot: 4 }
  return { category: 'Sangat Mahal (> 200rb)', bobot: 5 }
}

const calculateAtraksiSubKriteria = (atraksiText) => {
  if (!atraksiText?.trim()) return { count: 0, category: 'Sangat Kurang (< 2 item)', bobot: 1 }
  const count = atraksiText
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean).length
  if (count >= 6) return { count, category: 'Sangat Lengkap (> 5 item)', bobot: 5 }
  if (count >= 4) return { count, category: 'Lengkap (4-5 item)', bobot: 4 }
  if (count === 3) return { count, category: 'Cukup (3 item)', bobot: 3 }
  if (count === 2) return { count, category: 'Kurang (2 item)', bobot: 2 }
  return { count, category: 'Sangat Kurang (< 2 item)', bobot: 1 }
}

const getRatingSubKriteria = (rating) => {
  if (!rating || rating <= 0) return { category: '-', bobot: 0 }
  if (rating >= 4.5) return { category: 'Sangat Baik (4.5 - 5.0)', bobot: 5 }
  if (rating >= 4.0) return { category: 'Baik (4.0 - 4.4)', bobot: 4 }
  if (rating >= 3.5) return { category: 'Cukup (3.5 - 3.9)', bobot: 3 }
  if (rating >= 3.0) return { category: 'Buruk (3.0 - 3.4)', bobot: 2 }
  return { category: 'Sangat Buruk (< 3.0)', bobot: 1 }
}

export default function AdminAlternatif() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dialogVisible, setDialogVisible] = useState(false)
  const [facilityDialogVisible, setFacilityDialogVisible] = useState(false)
  const [selectedWisataForFacility, setSelectedWisataForFacility] = useState(null)
  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [globalFilter, setGlobalFilter] = useState('')
  const [first, setFirst] = useState(0)
  const [saving, setSaving] = useState(false)

  // Gambar Wisata (galeri)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [deletingGambarId, setDeletingGambarId] = useState(null)
  const fileUploadRef = useRef(null)

  const toast = useRef(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getAllAlternatif()
      setData(res.data?.data || [])
      setError(null)
    } catch {
      setError('Gagal memuat data alternatif.')
    } finally {
      setLoading(false)
    }
  }

  const openNew = () => {
    setForm({ ...emptyForm })
    setSelectedFiles([])
    setIsEdit(false)
    setEditId(null)
    setDialogVisible(true)
  }

  const openEdit = (rowData) => {
    setForm({
      ...rowData,
      atraksi_wisata: rowData.atraksi_wisata || '',
      gambar_list: rowData.gambar_list || [],
    })
    setSelectedFiles([])
    setIsEdit(true)
    setEditId(rowData.id_alternatif)
    setDialogVisible(true)
  }

  const hideDialog = () => {
    setDialogVisible(false)
    setForm({ ...emptyForm })
    setSelectedFiles([])
    if (fileUploadRef.current) fileUploadRef.current.clear()
  }

  const handleDeleteGambar = async (gambarId) => {
    setDeletingGambarId(gambarId)
    try {
      await api.delete(`/admin/wisata/${editId}/gambar/${gambarId}`)
      setForm((prev) => ({
        ...prev,
        gambar_list: prev.gambar_list.filter((g) => g.id !== gambarId),
      }))
      toast.current.show({ severity: 'success', summary: 'Berhasil', detail: 'Gambar dihapus', life: 2000 })
    } catch {
      toast.current.show({ severity: 'error', summary: 'Gagal', detail: 'Gagal menghapus gambar', life: 3000 })
    } finally {
      setDeletingGambarId(null)
    }
  }

  const saveData = async () => {
    if (!form.nama_wisata?.trim() || form.latitude == null || form.longitude == null) {
      toast.current.show({ severity: 'warn', summary: 'Validasi', detail: 'Nama, Latitude dan Longitude wajib diisi.', life: 3000 })
      return
    }
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('nama_wisata', form.nama_wisata)
      formData.append('latitude', form.latitude)
      formData.append('longitude', form.longitude)
      formData.append('rating_gmaps', form.rating_gmaps || 0)
      formData.append('harga_tiket', form.harga_tiket || 0)
      formData.append('atraksi_wisata', form.atraksi_wisata || '')
      formData.append('deskripsi', form.deskripsi || '')
      selectedFiles.forEach((f) => formData.append('gambar_list', f))

      if (isEdit) {
        await updateAlternatif(editId, formData)
      } else {
        await createAlternatif(formData)
      }
      toast.current.show({ severity: 'success', summary: 'Berhasil', detail: 'Data berhasil disimpan', life: 3000 })
      hideDialog()
      fetchData()
    } catch {
      toast.current.show({ severity: 'error', summary: 'Gagal', detail: 'Terjadi kesalahan saat menyimpan data', life: 3000 })
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = (rowData) => {
    confirmDialog({
      message: `Yakin ingin menghapus "${rowData.nama_wisata}"?`,
      header: 'Konfirmasi',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        await deleteAlternatif(rowData.id_alternatif)
        fetchData()
      },
    })
  }

  const actionTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" severity="info" size="small" rounded onClick={() => openEdit(rowData)} tooltip="Edit" />
      <Button icon="pi pi-trash" severity="danger" size="small" rounded onClick={() => confirmDelete(rowData)} tooltip="Hapus" />
      <Button
        icon="pi pi-chart-bar"
        severity="warning"
        size="small"
        rounded
        onClick={() => {
          setSelectedWisataForFacility(rowData)
          setFacilityDialogVisible(true)
        }}
        tooltip="Detail Sub Kriteria"
        tooltipOptions={ { position: 'top' } }
      />
    </div>
  )

  // Kolom "Gambar Wisata" (galeri)
  const imageTemplate = (rowData) => {
    const gambarList = rowData.gambar_list || []
    const gambarUtama = gambarList[0]?.nama_file || rowData.gambar
    if (!gambarUtama) return <span className="text-400 text-sm">-</span>
    return (
      <div className="flex align-items-center gap-1">
        <Image
          src={`${BACKEND_URL}/uploads/${gambarUtama}`}
          alt={rowData.nama_wisata}
          width="60"
          height="45"
          style={ { objectFit: 'cover', borderRadius: '4px' } }
          preview
        />
        {gambarList.length > 1 && <Tag value={`+${gambarList.length - 1}`} severity="info" rounded style={ { fontSize: '0.7rem' } } />}
      </div>
    )
  }

  const atraksiTemplate = (rowData) => {
    const { count } = calculateAtraksiSubKriteria(rowData.atraksi_wisata)
    return (
      <div className="flex flex-column gap-1">
        <span className="font-semibold text-purple-700 text-sm">{count} atraksi</span>
        <span className="text-sm text-600">{rowData.atraksi_wisata || '-'}</span>
      </div>
    )
  }

 const rowNumber = (_rowData, options) => options.rowIndex + 1

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />
      <h2 className="text-2xl font-bold text-800">Halaman Alternatif</h2>
      <hr className="border-top-1 border-300" />
      <div className="flex justify-content-between align-items-center mb-3">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText placeholder="Cari wisata..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} />
        </span>
        <Button label="Tambah Data" icon="pi pi-plus" onClick={openNew} />
      </div>
      {loading ? (
        <div className="flex justify-content-center py-6">
          <ProgressSpinner />
        </div>
      ) : error ? (
        <Message severity="error" text={error} />
      ) : (
        <DataTable
          value={data}
          paginator
          rows={5}
          stripedRows
          first={first}
          onPage={(e) => setFirst(e.first)}
          globalFilter={globalFilter}
          emptyMessage="Tidak ada data wisata."
        >
          <Column header="No" body={rowNumber} style={ { width: '60px' } } />
          <Column field="nama_wisata" header="Nama Wisata" sortable />
          <Column header="Gambar Wisata" body={imageTemplate} style={ { width: '110px' } } />
          <Column field="latitude" header="Latitude" sortable />
          <Column field="longitude" header="Longitude" sortable />
          <Column field="rating_gmaps" header="Rating" sortable />
          <Column field="harga_tiket" header="Harga Tiket" sortable />
          <Column header="Atraksi Wisata" body={atraksiTemplate} />
          <Column header="Aksi" body={actionTemplate} />
        </DataTable>
      )}

      {/* Dialog Tambah/Edit */}
      <Dialog
        visible={dialogVisible}
        header={isEdit ? 'Edit Data Wisata' : 'Tambah Data Wisata'}
        style={ { width: '560px', maxWidth: '95vw' } }
        modal
        onHide={hideDialog}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button label="Batal" icon="pi pi-times" severity="secondary" outlined onClick={hideDialog} />
            <Button label="Simpan" icon="pi pi-check" loading={saving} onClick={saveData} />
          </div>
        }
      >
        <div className="flex flex-column gap-3 pt-2">
          <div>
            <label className="block mb-1 font-semibold text-sm">Nama Wisata *</label>
            <InputText
              className="w-full"
              value={form.nama_wisata}
              onChange={(e) => setForm({ ...form, nama_wisata: e.target.value })}
              placeholder="Nama Wisata"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-sm">Deskripsi Wisata</label>
            <InputTextarea
              className="w-full"
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              placeholder="Deskripsi Wisata"
              rows={3}
            />
          </div>

          {/* Upload Gambar Wisata (galeri) */}
    {/* Upload Gambar Wisata (maksimal 1 foto) */}
{/* Upload Gambar Wisata (maksimal 1 foto) */}
<div>
  <label className="block mb-1 font-semibold text-sm">
    <i className="pi pi-image mr-1"></i>
    Gambar Wisata (maksimal 1 foto)
  </label>
  <FileUpload
    ref={fileUploadRef}
    mode="advanced"
    accept="image/*"
    maxFileSize={10000000}
    chooseLabel={(form.gambar_list?.length || 0) > 0 ? 'Ganti Foto' : 'Tambah Foto'}
    customUpload
    auto={false}
    uploadOptions={ { style: { display: 'none' } } }
    onSelect={(e) => setSelectedFiles(e.files.slice(0, 1))}
    onClear={() => setSelectedFiles([])}
    onRemove={() => setSelectedFiles([])}
  />
  {selectedFiles.length > 0 && (
    <div className="mt-1">
      <Tag icon="pi pi-check-circle" value="1 file dipilih" severity="success" />
    </div>
  )}
</div>

          {/* Daftar Gambar Wisata tersimpan (saat edit) */}
          {isEdit && form.gambar_list && form.gambar_list.length > 0 && (
            <div>
              <label className="block mb-1 font-semibold text-sm">Gambar Wisata Tersimpan ({form.gambar_list.length})</label>
              <div className="flex flex-wrap gap-2">
                {form.gambar_list.map((g, i) => (
                  <div key={g.id} className="relative border-round overflow-hidden border-1 border-300" style={ { width: '80px', height: '80px' } }>
                    <img
                      src={`${BACKEND_URL}/uploads/${g.nama_file}`}
                      alt={`gambar-${i + 1}`}
                      style={ { width: '100%', height: '100%', objectFit: 'cover' } }
                    />
                    {i === 0 && (
                      <Tag value="Utama" severity="success" style={ { position: 'absolute', bottom: '2px', left: '2px', fontSize: '0.6rem' } } />
                    )}
                    <Button
                      icon={deletingGambarId === g.id ? 'pi pi-spin pi-spinner' : 'pi pi-times'}
                      severity="danger"
                      rounded
                      disabled={deletingGambarId === g.id}
                      onClick={() => handleDeleteGambar(g.id)}
                      style={ { position: 'absolute', top: '2px', right: '2px', width: '20px', height: '20px', padding: 0 } }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid">
            <div className="col-6">
              <label className="block mb-1 font-semibold text-sm">Latitude *</label>
              <InputNumber
                className="w-full"
                value={form.latitude}
                onValueChange={(e) => setForm({ ...form, latitude: e.value })}
                placeholder="Latitude"
                mode="decimal"
                minFractionDigits={4}
                maxFractionDigits={6}
              />
            </div>
            <div className="col-6">
              <label className="block mb-1 font-semibold text-sm">Longitude *</label>
              <InputNumber
                className="w-full"
                value={form.longitude}
                onValueChange={(e) => setForm({ ...form, longitude: e.value })}
                placeholder="Longitude"
                mode="decimal"
                minFractionDigits={4}
                maxFractionDigits={6}
              />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-sm">Rating Google Maps</label>
            <InputNumber
              className="w-full"
              value={form.rating_gmaps}
              onValueChange={(e) => setForm({ ...form, rating_gmaps: e.value })}
              placeholder="0 - 5"
              mode="decimal"
              min={0}
              max={5}
              step={0.1}
              minFractionDigits={1}
            />
            {form.rating_gmaps > 0 && (
              <div className="mt-1 p-2 bg-blue-50 border-round">
                <small className="text-600">
                  {getRatingSubKriteria(form.rating_gmaps).category}{' '}
                  <span className="text-blue-600">(Bobot: {getRatingSubKriteria(form.rating_gmaps).bobot})</span>
                </small>
              </div>
            )}
          </div>
          <div>
            <label className="block mb-1 font-semibold text-sm">Harga Tiket (Rupiah)</label>
            <InputNumber
              className="w-full"
              value={form.harga_tiket}
              onValueChange={(e) => setForm({ ...form, harga_tiket: e.value })}
              placeholder="Harga Tiket (Rp)"
              min={0}
              mode="currency"
              currency="IDR"
              locale="id-ID"
            />
            {form.harga_tiket > 0 && (
              <div className="mt-1 p-2 bg-green-50 border-round">
                <small className="text-600">
                  {getHargaSubKriteria(form.harga_tiket).category}{' '}
                  <span className="text-green-600">(Bobot: {getHargaSubKriteria(form.harga_tiket).bobot})</span>
                </small>
              </div>
            )}
          </div>
          <div>
            <label className="block mb-1 font-semibold text-sm">Atraksi Wisata (pisahkan dengan koma)</label>
            <InputText
              className="w-full"
              value={form.atraksi_wisata}
              onChange={(e) => setForm({ ...form, atraksi_wisata: e.target.value })}
              placeholder="Spot Foto, Wahana Air, Trekking"
            />
            {form.atraksi_wisata?.trim() && (
              <div className="mt-1 p-2 bg-purple-50 border-round">
                <small className="text-600">
                  {calculateAtraksiSubKriteria(form.atraksi_wisata).count} item — {calculateAtraksiSubKriteria(form.atraksi_wisata).category}{' '}
                  <span className="text-purple-600">(Bobot: {calculateAtraksiSubKriteria(form.atraksi_wisata).bobot})</span>
                </small>
              </div>
            )}
          </div>
        </div>
      </Dialog>

      {/* Dialog Sub Kriteria */}
      <Dialog
        visible={facilityDialogVisible}
        header="Detail Sub Kriteria"
        modal
        style={ { width: '700px', maxWidth: '95vw' } }
        onHide={() => setFacilityDialogVisible(false)}
      >
        {selectedWisataForFacility &&
          (() => {
            const f = calculateAtraksiSubKriteria(selectedWisataForFacility.atraksi_wisata)
            const r = getRatingSubKriteria(selectedWisataForFacility.rating_gmaps)
            const h = getHargaSubKriteria(selectedWisataForFacility.harga_tiket)
            return (
              <div className="flex flex-column gap-3">
                <h3 className="text-xl font-bold text-800 mt-0 mb-0">{selectedWisataForFacility.nama_wisata}</h3>
                <hr className="mt-0" />
                {[
                  { label: 'Rating Google Maps', nilai: `${selectedWisataForFacility.rating_gmaps || 0} / 5.0`, cat: r, color: 'blue' },
                  {
                    label: 'Harga Tiket',
                    nilai: `Rp ${(selectedWisataForFacility.harga_tiket || 0).toLocaleString('id-ID')}`,
                    cat: h,
                    color: 'green',
                  },
                  { label: 'Atraksi Wisata', nilai: `${f.count} item`, cat: f, color: 'purple' },
                ].map(({ label, nilai, cat, color }) => (
                  <div key={label} className="surface-50 border-round p-3">
                    <h4 className={`text-lg font-bold text-${color}-700 mt-0 mb-2`}>{label}</h4>
                    <div className="grid">
                      <div className="col-4">
                        <span className="text-600 text-sm block mb-1">Nilai</span>
                        <div className="font-semibold text-xl">{nilai}</div>
                      </div>
                      <div className="col-4">
                        <span className="text-600 text-sm block mb-1">Kategori</span>
                        <div className="font-semibold">{cat.category}</div>
                      </div>
                      <div className="col-4">
                        <span className="text-600 text-sm block mb-1">Bobot</span>
                        <div className={`text-${color}-600 font-semibold text-2xl`}>{cat.bobot}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
      </Dialog>
    </>
  )
}