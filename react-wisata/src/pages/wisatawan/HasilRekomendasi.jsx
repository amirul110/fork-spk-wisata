import "../dashboard.css";
import Sidebar from "../../components/Sidebar";
import { wisatawanMenu } from "../../app/wisatawanMenu";

export default function HasilRekomendasi() {
  return (
    <div className="page">
      <Sidebar items={wisatawanMenu} />

      <main className="content">
        <h2>Halaman Hasil Rekomendasi</h2>
        <div className="hrline" />

        <table className="table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Wisata</th>
              <th>Jarak (KM)</th>
              <th>Skor Akhir WP</th>
              <th>Peringkat ke</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Wisata 1</td>
              <td>10 KM</td>
              <td>0.122</td>
              <td>1</td>
            </tr>
          </tbody>
        </table>
      </main>
    </div>
  );
}
