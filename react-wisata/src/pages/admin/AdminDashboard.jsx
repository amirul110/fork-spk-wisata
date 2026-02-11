import "../dashboard.css";
import Sidebar from "../../components/Sidebar";
import { adminMenu } from "../../app/adminMenu";

export default function AdminDashboard() {
  return (
    <div className="page">
      <Sidebar items={adminMenu} />

      <main className="content">
        <h2>Selamat datang di halaman dashboard</h2>
        <div className="hrline" />

        <div className="box">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>No</th>
                <th style={{ width: 140 }}>Alternatif</th>
                <th>Nama Kriteria</th>
                <th style={{ width: 90 }}>Bobot</th>
                <th style={{ width: 90 }}>Jenis</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Wisata 1</td>
                <td>Harga Tiket masuk</td>
                <td>0.3</td>
                <td>Const</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
