import { useState, useEffect, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
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
  waktu_kunjungan: ''
}

export default function AdminAlternatif () {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dialogVisible, setDialogVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [globalFilter, setGlobalFilter] = useState('')
  const [first, setFirst] = useState(0)
  const [saving, setSaving] = useState(false)
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
    setIsEdit(false)
    setEditId(null)
    setDialogVisible(true)
  }

  const openEdit = rowData => {
    setForm({ ...rowData })
    setIsEdit(true)
    setEditId(rowData.id_alternatif)
    setDialogVisible(true)
  }

  const hideDialog = () => {
    setDialogVisible(false)
    setForm({ ...emptyForm })
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
      if (isEdit) {
        await updateAlternatif(editId, form)
      } else {
        await createAlternatif(form)
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

  const actionTemplate = rowData => (
    <div className='flex gap-2'>
      <Button
        icon='pi pi-pencil'
        severity='info'
        size='small'
        rounded
        onClick={() => openEdit(rowData)}
      />
      <Button
        icon='pi pi-trash'
        severity='danger'
        size='small'
        rounded
        onClick={() => confirmDelete(rowData)}
      />
    </div>
  )

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
      </main>
    </div>
  )
}
