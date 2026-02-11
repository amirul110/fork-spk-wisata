import "../dashboard.css";
import Sidebar from "../../components/Sidebar";
import { adminMenu } from "../../app/adminMenu";

export default function AdminAlternatif() {
  // dummy data (nanti ganti dari backend)
  const data = [
    {
      id: 1,
      nama: "Wisata A",
      lat: "-7.701",
      lng: "111.4253",
      rating: 4.5,
      harga: "Rp. 5.000",
      fasilitas: "Toilet",
      waktu: "08.00 - 16.00",
    },
  ];

  const handleAdd = () => {
    alert("Aksi: Tambah Data");
  };

  const handleEdit = (id) => {
    alert(`Edit data id ${id}`);
  };

  const handleDelete = (id) => {
    if (confirm("Yakin ingin menghapus data ini?")) {
      alert(`Hapus data id ${id}`);
    }
  };

  return (
    <div className="page">
      <Sidebar items={adminMenu} />

      <main className="content">
        <h2>Halaman Alternatif</h2>
        <div className="hrline" />

        <button className="btn" onClick={handleAdd}>
          Tambah Data
        </button>

        <div className="box" style={{ marginTop: 14 }}>
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Wisata</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Rating Gmaps</th>
                <th>Harga Tiket</th>
                <th>Fasilitas</th>
                <th>Waktu Kunjungan</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {data.map((d, i) => (
                <tr key={d.id}>
                  <td>{i + 1}</td>
                  <td>{d.nama}</td>
                  <td>{d.lat}</td>
                  <td>{d.lng}</td>
                  <td>{d.rating}</td>
                  <td>{d.harga}</td>
                  <td>{d.fasilitas}</td>
                  <td>{d.waktu}</td>
                  <td>
                    <button
                      className="btn"
                      style={{ marginRight: 6 }}
                      onClick={() => handleEdit(d.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn"
                      onClick={() => handleDelete(d.id)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
