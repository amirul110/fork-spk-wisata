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

import '../dashboard.css'
import Sidebar from '../../components/Sidebar'
import { adminMenu } from '../../app/adminMenu'

import {
  getAllAlternatif,
  createAlternatif,
  updateAlternatif,
  deleteAlternatif
} from '../../services/alternatif.service'

const emptyForm = {
  nama_wisata: '',
  latitude: null,
  longitude: null,
  rating_gmaps: null,
  harga_tiket: null,
  fasilitas: '',
  waktu_kunjungan: '',
  deskripsi: '',
  gambar: null
}

export default function AdminAlternatif () {
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
  const [selectedFile, setSelectedFile] = useState(null)
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
    setSelectedFile(null)
    setIsEdit(false)
    setEditId(null)
    setDialogVisible(true)
  }

  const openEdit = rowData => {
    setForm({ ...rowData })
    setSelectedFile(null)
    setIsEdit(true)
    setEditId(rowData.id_alternatif)
    setDialogVisible(true)
  }

  const hideDialog = () => {
    setDialogVisible(false)
    setForm({ ...emptyForm })
    setSelectedFile(null)
    if (fileUploadRef.current) {
      fileUploadRef.current.clear()
    }
  }

  const saveData = async () => {
    if (
      !form.nama_wisata?.trim() ||
      form.latitude == null ||
      form.longitude == null
    ) {
      toast.current.show({
        severity: 'warn',
        summary: 'Validasi',
        detail: 'Nama, Latitude dan Longitude wajib diisi.',
        life: 3000
      })
      return
    }

    setSaving(true)
    try {
      // Create FormData for multipart/form-data
      const formData = new FormData()
      formData.append('nama_wisata', form.nama_wisata)
      formData.append('latitude', form.latitude)
      formData.append('longitude', form.longitude)
      formData.append('rating_gmaps', form.rating_gmaps || 0)
      formData.append('harga_tiket', form.harga_tiket || 0)
      formData.append('fasilitas', form.fasilitas || '')
      formData.append('waktu_kunjungan', form.waktu_kunjungan || '')
      formData.append('deskripsi', form.deskripsi || '')
      
      if (selectedFile) {
        formData.append('gambar', selectedFile)
      }

      if (isEdit) {
        await updateAlternatif(editId, formData)
      } else {
        await createAlternatif(formData)
      }

      toast.current.show({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Data berhasil disimpan',
        life: 3000
      })

      hideDialog()
      fetchData()
    } catch {
      toast.current.show({
        severity: 'error',
        summary: 'Gagal',
        detail: 'Terjadi kesalahan saat menyimpan data',
        life: 3000
      })
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = rowData => {
    confirmDialog({
      message: `Yakin ingin menghapus "${rowData.nama_wisata}"?`,
      header: 'Konfirmasi',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        await deleteAlternatif(rowData.id_alternatif)
        fetchData()
      }
    })
  }

  const calculateFacilitySubKriteria = (facilityText) => {
    if (!facilityText || !facilityText.trim()) {
      return { count: 0, category: 'Sangat Kurang', range: '0-1 item', bobot: 1 }
    }
    
    const count = facilityText.split(',').map(f => f.trim()).filter(f => f).length
    
    if (count >= 6) {
      return { count, category: 'Sangat Lengkap', range: '> 5 item', bobot: 5 }
    } else if (count >= 4) {
      return { count, category: 'Lengkap', range: '4-5 item', bobot: 4 }
    } else if (count === 3) {
      return { count, category: 'Cukup', range: '3 item', bobot: 3 }
    } else if (count === 2) {
      return { count, category: 'Kurang', range: '2 item', bobot: 2 }
    } else {
      return { count, category: 'Sangat Kurang', range: '0-1 item', bobot: 1 }
    }
  }

  const showFacilityClassification = (rowData) => {
    setSelectedWisataForFacility(rowData)
    setFacilityDialogVisible(true)
  }

  const actionTemplate = rowData => (
    <div className='flex gap-2'>
      <Button
        icon='pi pi-pencil'
        severity='info'
        size='small'
        rounded
        onClick={() => openEdit(rowData)}
        tooltip="Edit"
      />
      <Button
        icon='pi pi-trash'
        severity='danger'
        size='small'
        rounded
        onClick={() => confirmDelete(rowData)}
        tooltip="Hapus"
      />
      <Button
        icon='pi pi-chart-bar'
        severity='warning'
        size='small'
        rounded
        onClick={() => showFacilityClassification(rowData)}
        tooltip="Klasifikasi Fasilitas"
      />
    </div>
  )

  const imageTemplate = (rowData) => {
    if (rowData.gambar) {
      const baseURL = import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
      return (
        <Image 
          src={`${baseURL}/uploads/${rowData.gambar}`} 
          alt={rowData.nama_wisata}
          width="80"
          preview
        />
      )
    }
    return <span className="text-400">-</span>
  }

  const rowNumber = (_rowData, options) => first + options.rowIndex + 1

  return (
    <div className='page'>
      <Sidebar items={adminMenu} />
      <Toast ref={toast} />
      <ConfirmDialog />

      <main className='content'>
        <h2 className='text-2xl font-bold text-800'>Halaman Alternatif</h2>
        <hr className='border-top-1 border-300' />

        <div className='flex justify-content-between align-items-center mb-3'>
          <span className='p-input-icon-left'>
            <i className='pi pi-search' />
            <InputText
              placeholder='Cari wisata...'
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
            />
          </span>
          <Button label='Tambah Data' icon='pi pi-plus' onClick={openNew} />
        </div>

        {loading ? (
          <div className='flex justify-content-center py-6'>
            <ProgressSpinner />
          </div>
        ) : error ? (
          <Message severity='error' text={error} />
        ) : (
          <DataTable
            value={data}
            paginator
            rows={5}
            stripedRows
            first={first}
            onPage={e => setFirst(e.first)}
            globalFilter={globalFilter}
            emptyMessage='Tidak ada data wisata.'
          >
            <Column header='No' body={rowNumber} style={{ width: '60px' }} />
            <Column field='nama_wisata' header='Nama Wisata' sortable />
            <Column header='Gambar' body={imageTemplate} style={{ width: '100px' }} />
            <Column field='latitude' header='Latitude' sortable />
            <Column field='longitude' header='Longitude' sortable />
            <Column field='rating_gmaps' header='Rating' sortable />
            <Column field='harga_tiket' header='Harga Tiket' sortable />
            <Column field='fasilitas' header='Fasilitas' sortable />
            <Column field='waktu_kunjungan' header='Waktu Kunjungan' sortable />
            <Column header='Aksi' body={actionTemplate} />
          </DataTable>
        )}

        <Dialog
          visible={dialogVisible}
          header={isEdit ? 'Edit Data Wisata' : 'Tambah Data Wisata'}
          style={{ width: '500px' }}
          modal
          onHide={hideDialog}
          footer={
            <div className='flex justify-content-end gap-2'>
              <Button
                label='Batal'
                icon='pi pi-times'
                severity='secondary'
                outlined
                onClick={hideDialog}
              />
              <Button
                label='Simpan'
                icon='pi pi-check'
                loading={saving}
                onClick={saveData}
              />
            </div>
          }
        >
          <div className='flex flex-column gap-3 pt-2'>
            <InputText
              value={form.nama_wisata}
              onChange={e => setForm({ ...form, nama_wisata: e.target.value })}
              placeholder='Nama Wisata'
            />

            <InputTextarea
              value={form.deskripsi}
              onChange={e => setForm({ ...form, deskripsi: e.target.value })}
              placeholder='Deskripsi Wisata'
              rows={3}
            />

            <div>
              <label className='block mb-2 font-semibold text-sm'>Gambar Wisata</label>
              <FileUpload
                ref={fileUploadRef}
                mode="basic"
                name="gambar"
                accept="image/*"
                maxFileSize={5000000}
                onSelect={(e) => setSelectedFile(e.files[0])}
                onClear={() => setSelectedFile(null)}
                chooseLabel={selectedFile ? selectedFile.name : "Pilih Gambar"}
                auto={false}
              />
              {isEdit && form.gambar && !selectedFile && (
                <div className="mt-2">
                  <span className="text-sm text-500">Gambar saat ini: {form.gambar}</span>
                </div>
              )}
            </div>

            <InputNumber
              value={form.latitude}
              onValueChange={e => setForm({ ...form, latitude: e.value })}
              placeholder='Latitude'
              mode='decimal'
            />

            <InputNumber
              value={form.longitude}
              onValueChange={e => setForm({ ...form, longitude: e.value })}
              placeholder='Longitude'
              mode='decimal'
            />

            <InputNumber
              value={form.rating_gmaps}
              onValueChange={e => setForm({ ...form, rating_gmaps: e.value })}
              placeholder='Rating'
              mode='decimal'
              min={0}
              max={5}
            />

            <InputNumber
              value={form.harga_tiket}
              onValueChange={e => setForm({ ...form, harga_tiket: e.value })}
              placeholder='Harga Tiket'
              min={0}
            />

            <InputText
              value={form.fasilitas}
              onChange={e => setForm({ ...form, fasilitas: e.target.value })}
              placeholder='Fasilitas'
            />

            <InputText
              value={form.waktu_kunjungan}
              onChange={e =>
                setForm({ ...form, waktu_kunjungan: e.target.value })
              }
              placeholder='Waktu Kunjungan'
            />
          </div>
        </Dialog>

        {/* Dialog Klasifikasi Fasilitas */}
        <Dialog
          visible={facilityDialogVisible}
          header="Klasifikasi Sub-Kriteria Fasilitas"
          modal
          style={{ width: '600px', maxWidth: '95vw' }}
          onHide={() => setFacilityDialogVisible(false)}
        >
          {selectedWisataForFacility && (() => {
            const classification = calculateFacilitySubKriteria(selectedWisataForFacility.fasilitas)
            return (
              <div className='flex flex-column gap-3'>
                <h3 className='text-xl font-bold text-800 mt-0 mb-2'>
                  {selectedWisataForFacility.nama_wisata}
                </h3>
                <hr className='mt-0 mb-2' />
                
                <div className='grid'>
                  <div className='col-12'>
                    <div className='mb-3'>
                      <span className='font-bold text-600 text-sm'>Fasilitas</span>
                      <div className='text-800 mt-1'>
                        {selectedWisataForFacility.fasilitas || '-'}
                      </div>
                    </div>
                  </div>
                  
                  <div className='col-12 md:col-6'>
                    <div className='mb-3'>
                      <span className='font-bold text-600 text-sm'>Jumlah Fasilitas</span>
                      <div className='text-800 font-semibold text-2xl mt-1'>
                        {classification.count} item
                      </div>
                    </div>
                  </div>
                  
                  <div className='col-12 md:col-6'>
                    <div className='mb-3'>
                      <span className='font-bold text-600 text-sm'>Kategori Sub-Kriteria</span>
                      <div className='text-800 font-semibold text-2xl mt-1'>
                        {classification.category}
                      </div>
                    </div>
                  </div>
                  
                  <div className='col-12 md:col-6'>
                    <div className='mb-3'>
                      <span className='font-bold text-600 text-sm'>Range</span>
                      <div className='text-800 mt-1'>
                        {classification.range}
                      </div>
                    </div>
                  </div>
                  
                  <div className='col-12 md:col-6'>
                    <div className='mb-3'>
                      <span className='font-bold text-600 text-sm'>Nilai Bobot</span>
                      <div className='text-800 font-semibold text-2xl mt-1'>
                        {classification.bobot}
                      </div>
                    </div>
                  </div>
                  
                  <div className='col-12'>
                    <div className='surface-100 border-round p-3'>
                      <p className='text-600 text-sm m-0'>
                        <strong>Keterangan:</strong> Berdasarkan kriteria fasilitas, wisata ini masuk kategori 
                        "<strong>{classification.category}</strong>" dengan {classification.count} fasilitas yang tersedia.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </Dialog>
      </main>
    </div>
  )
}
