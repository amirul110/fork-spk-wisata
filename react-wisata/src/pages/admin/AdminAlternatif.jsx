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
  atraksi_wisata: '',
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
    setForm({
      ...rowData,
      atraksi_wisata: rowData.atraksi_wisata || ''
    })
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
      formData.append('atraksi_wisata', form.atraksi_wisata || '')
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

  // Helper functions to calculate sub-kriteria for each kriteria
  const getHargaSubKriteria = (harga) => {
    if (!harga || harga <= 0) return { category: '-', bobot: 0 }
    if (harga <= 20000) return { category: 'Sangat Murah (< 20rb)', bobot: 1 }
    if (harga <= 50000) return { category: 'Murah (20rb - 50rb)', bobot: 2 }
    if (harga <= 100000) return { category: 'Sedang (50rb - 100rb)', bobot: 3 }
    if (harga <= 200000) return { category: 'Mahal (100rb - 200rb)', bobot: 4 }
    return { category: 'Sangat Mahal (> 200rb)', bobot: 5 }
  }

  const calculateAtraksiWisataSubKriteria = (atraksiText) => {
    if (!atraksiText || !atraksiText.trim()) {
      return { count: 0, category: 'Sangat Kurang (< 2 item)', bobot: 1 }
    }
    
    const count = atraksiText.split(',').map(f => f.trim()).filter(f => f).length
    
    if (count >= 6) {
      return { count, category: 'Sangat Lengkap (> 5 item)', bobot: 5 }
    } else if (count >= 4) {
      return { count, category: 'Lengkap (4-5 item)', bobot: 4 }
    } else if (count === 3) {
      return { count, category: 'Cukup (3 item)', bobot: 3 }
    } else if (count === 2) {
      return { count, category: 'Kurang (2 item)', bobot: 2 }
    } else {
      return { count, category: 'Sangat Kurang (< 2 item)', bobot: 1 }
    }
  }

  const getRatingSubKriteria = (rating) => {
    if (!rating || rating <= 0) return { category: '-', bobot: 0 }
    if (rating >= 4.5) return { category: 'Sangat Baik (4.5 - 5.0)', bobot: 5 }
    if (rating >= 4.0) return { category: 'Baik (4.0 - 4.4)', bobot: 4 }
    if (rating >= 3.5) return { category: 'Cukup (3.5 - 3.9)', bobot: 3 }
    if (rating >= 3.0) return { category: 'Buruk (3.0 - 3.4)', bobot: 2 }
    return { category: 'Sangat Buruk (< 3.0)', bobot: 1 }
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
        tooltip="Detail Sub Kriteria"
        tooltipOptions={{ position: 'top' }}
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

  const atraksiWisataTemplate = rowData => {
    const atraksiWisata = rowData.atraksi_wisata || ''
    const jumlahAtraksi = calculateAtraksiWisataSubKriteria(atraksiWisata).count

    return (
      <div className='flex flex-column gap-2'>
        <span className='font-semibold text-purple-700'>
          {jumlahAtraksi} atraksi
        </span>
        <span>{atraksiWisata || '-'}</span>
      </div>
    )
  }

  const rowNumber = (_rowData, options) => first + options.rowIndex + 1

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

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
            <Column field='atraksi_wisata' header='Atraksi Wisata' body={atraksiWisataTemplate} sortable />
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
            <div>
              <label className='block mb-2 font-semibold text-sm'>Nama Wisata</label>
              <InputText
                value={form.nama_wisata}
                onChange={e => setForm({ ...form, nama_wisata: e.target.value })}
                placeholder='Nama Wisata'
              />
            </div>

            <div>
              <label className='block mb-2 font-semibold text-sm'>Deskripsi Wisata</label>
              <InputTextarea
                value={form.deskripsi}
                onChange={e => setForm({ ...form, deskripsi: e.target.value })}
                placeholder='Deskripsi Wisata'
                rows={3}
              />
            </div>

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

            <div>
              <label className='block mb-2 font-semibold text-sm'>Latitude</label>
              <InputNumber
                value={form.latitude}
                onValueChange={e => setForm({ ...form, latitude: e.value })}
                placeholder='Latitude'
                mode='decimal'
              />
            </div>

            <div>
              <label className='block mb-2 font-semibold text-sm'>Longitude</label>
              <InputNumber
                value={form.longitude}
                onValueChange={e => setForm({ ...form, longitude: e.value })}
                placeholder='Longitude'
                mode='decimal'
              />
            </div>

            <div>
              <label className='block mb-2 font-semibold text-sm'>Rating Google Maps</label>
              <InputNumber
                value={form.rating_gmaps}
                onValueChange={e => setForm({ ...form, rating_gmaps: e.value })}
                placeholder='Rating (0-5)'
                mode='decimal'
                min={0}
                max={5}
                step={0.1}
              />
              {form.rating_gmaps > 0 && (
                <div className='mt-2 p-2 bg-blue-50 border-round'>
                  <small className='text-600'>
                    <strong>Sub-Kriteria:</strong> {getRatingSubKriteria(form.rating_gmaps).category} 
                    {' '}<span className='text-blue-600'>(Bobot: {getRatingSubKriteria(form.rating_gmaps).bobot})</span>
                  </small>
                </div>
              )}
            </div>

            <div>
              <label className='block mb-2 font-semibold text-sm'>Harga Tiket (Rupiah)</label>
              <InputNumber
                value={form.harga_tiket}
                onValueChange={e => setForm({ ...form, harga_tiket: e.value })}
                placeholder='Harga Tiket (Rp)'
                min={0}
                mode='currency'
                currency='IDR'
                locale='id-ID'
              />
              {form.harga_tiket > 0 && (
                <div className='mt-2 p-2 bg-green-50 border-round'>
                  <small className='text-600'>
                    <strong>Sub-Kriteria:</strong> {getHargaSubKriteria(form.harga_tiket).category} 
                    {' '}<span className='text-green-600'>(Bobot: {getHargaSubKriteria(form.harga_tiket).bobot})</span>
                  </small>
                </div>
              )}
            </div>

            <div>
              <label className='block mb-2 font-semibold text-sm'>Atraksi Wisata (pisahkan dengan koma)</label>
              <InputText
                value={form.atraksi_wisata}
                onChange={e => setForm({ ...form, atraksi_wisata: e.target.value })}
                placeholder='Contoh: Spot Foto, Wahana Air, Pertunjukan Budaya, Trekking'
              />
              {form.atraksi_wisata && form.atraksi_wisata.trim() && (
                <div className='mt-2 p-2 bg-purple-50 border-round'>
                  <small className='text-600'>
                    <strong>Jumlah:</strong> {calculateAtraksiWisataSubKriteria(form.atraksi_wisata).count} item
                    {' | '}
                    <strong>Sub-Kriteria:</strong> {calculateAtraksiWisataSubKriteria(form.atraksi_wisata).category} 
                    {' '}<span className='text-purple-600'>(Bobot: {calculateAtraksiWisataSubKriteria(form.atraksi_wisata).bobot})</span>
                  </small>
                </div>
              )}
            </div>
          </div>
        </Dialog>

        {/* Dialog Klasifikasi Semua Sub-Kriteria */}
        <Dialog
          visible={facilityDialogVisible}
          header="Detail Sub Kriteria"
          modal
          style={{ width: '700px', maxWidth: '95vw' }}
          onHide={() => setFacilityDialogVisible(false)}
        >
          {selectedWisataForFacility && (() => {
            const facilityClassification = calculateAtraksiWisataSubKriteria(selectedWisataForFacility.atraksi_wisata)
            const ratingClassification = getRatingSubKriteria(selectedWisataForFacility.rating_gmaps)
            const hargaClassification = getHargaSubKriteria(selectedWisataForFacility.harga_tiket)
            
            return (
              <div className='flex flex-column gap-3'>
                <h3 className='text-xl font-bold text-800 mt-0 mb-2'>
                  {selectedWisataForFacility.nama_wisata}
                </h3>
                <hr className='mt-0 mb-2' />
                
                {/* Rating Sub-Kriteria */}
                <div className='surface-50 border-round p-3 mb-2'>
                  <h4 className='text-lg font-bold text-blue-700 mt-0 mb-2'>Rating Google Maps</h4>
                  <div className='grid'>
                    <div className='col-12 md:col-4'>
                      <span className='font-bold text-600 text-sm block mb-1'>Nilai Rating</span>
                      <div className='text-800 font-semibold text-2xl'>
                        {selectedWisataForFacility.rating_gmaps || 0} / 5.0
                      </div>
                    </div>
                    <div className='col-12 md:col-4'>
                      <span className='font-bold text-600 text-sm block mb-1'>Kategori Sub-Kriteria</span>
                      <div className='text-800 font-semibold text-lg'>
                        {ratingClassification.category}
                      </div>
                    </div>
                    <div className='col-12 md:col-4'>
                      <span className='font-bold text-600 text-sm block mb-1'>Nilai Bobot</span>
                      <div className='text-blue-600 font-semibold text-2xl'>
                        {ratingClassification.bobot}
                      </div>
                    </div>
                    <div className='col-12 mt-2'>
                      <div className='bg-blue-100 border-round p-2'>
                        <p className='text-600 text-sm m-0'>
                          <strong>Keterangan:</strong> Berdasarkan kriteria rating, wisata ini masuk kategori 
                          "<strong>{ratingClassification.category}</strong>" dengan rating {selectedWisataForFacility.rating_gmaps || 0}.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Harga Tiket Sub-Kriteria */}
                <div className='surface-50 border-round p-3 mb-2'>
                  <h4 className='text-lg font-bold text-green-700 mt-0 mb-2'>Harga Tiket</h4>
                  <div className='grid'>
                    <div className='col-12 md:col-4'>
                      <span className='font-bold text-600 text-sm block mb-1'>Harga Tiket</span>
                      <div className='text-800 font-semibold text-xl'>
                        Rp {(selectedWisataForFacility.harga_tiket || 0).toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className='col-12 md:col-4'>
                      <span className='font-bold text-600 text-sm block mb-1'>Kategori Sub-Kriteria</span>
                      <div className='text-800 font-semibold text-lg'>
                        {hargaClassification.category}
                      </div>
                    </div>
                    <div className='col-12 md:col-4'>
                      <span className='font-bold text-600 text-sm block mb-1'>Nilai Bobot</span>
                      <div className='text-green-600 font-semibold text-2xl'>
                        {hargaClassification.bobot}
                      </div>
                    </div>
                    <div className='col-12 mt-2'>
                      <div className='bg-green-100 border-round p-2'>
                        <p className='text-600 text-sm m-0'>
                          <strong>Keterangan:</strong> Berdasarkan kriteria harga tiket, wisata ini masuk kategori 
                          "<strong>{hargaClassification.category}</strong>" dengan harga Rp {(selectedWisataForFacility.harga_tiket || 0).toLocaleString('id-ID')}.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Atraksi Wisata Sub-Kriteria */}
                <div className='surface-50 border-round p-3 mb-2'>
                  <h4 className='text-lg font-bold text-purple-700 mt-0 mb-2'>Atraksi Wisata</h4>
                  <div className='grid'>
                    <div className='col-12'>
                      <span className='font-bold text-600 text-sm block mb-1'>Daftar Atraksi Wisata</span>
                      <div className='text-800'>
                        {selectedWisataForFacility.atraksi_wisata || '-'}
                      </div>
                    </div>
                    <div className='col-12 md:col-4 mt-2'>
                      <span className='font-bold text-600 text-sm block mb-1'>Jumlah Atraksi</span>
                      <div className='text-800 font-semibold text-2xl'>
                        {facilityClassification.count} item
                      </div>
                    </div>
                    <div className='col-12 md:col-4 mt-2'>
                      <span className='font-bold text-600 text-sm block mb-1'>Kategori Sub-Kriteria</span>
                      <div className='text-800 font-semibold text-lg'>
                        {facilityClassification.category}
                      </div>
                    </div>
                    <div className='col-12 md:col-4 mt-2'>
                      <span className='font-bold text-600 text-sm block mb-1'>Nilai Bobot</span>
                      <div className='text-purple-600 font-semibold text-2xl'>
                        {facilityClassification.bobot}
                      </div>
                    </div>
                    <div className='col-12 mt-2'>
                      <div className='bg-purple-100 border-round p-2'>
                        <p className='text-600 text-sm m-0'>
                          <strong>Keterangan:</strong> Berdasarkan kriteria atraksi wisata, wisata ini masuk kategori 
                          "<strong>{facilityClassification.category}</strong>" dengan {facilityClassification.count} atraksi yang tersedia.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </Dialog>
    </>
  )
}
