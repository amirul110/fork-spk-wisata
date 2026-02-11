import { useNavigate } from "react-router-dom";
import "../dashboard.css";
import Sidebar from "../../components/Sidebar";
import { wisatawanMenu } from "../../app/wisatawanMenu";

export default function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="page">
      <Sidebar items={wisatawanMenu} />

      <main className="content logout-center">
        <div className="logout-box">
          <h2>Halaman Logout</h2>
          <p>Apakah Anda yakin ingin keluar?</p>
          <button className="btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}
