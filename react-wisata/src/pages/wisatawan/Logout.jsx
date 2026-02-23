import { useNavigate } from "react-router-dom";
import { clearSelectedWisata } from "../../store/wisataStore";
import { Card } from "primereact/card";
import { Button } from "primereact/button";

export default function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    clearSelectedWisata();
    navigate("/login");
  };

  return (
    <>
      <div className="flex align-items-center justify-content-center min-h-screen">
        <Card className="shadow-2 text-center" style={{ minWidth: 320 }}>
          <i className="pi pi-sign-out text-4xl text-500 mb-3"></i>
          <h2 className="text-xl font-bold text-800 mt-0 mb-2">Halaman Logout</h2>
          <p className="text-600 mb-3">Apakah Anda yakin ingin keluar?</p>
          <Button
            label="Logout"
            icon="pi pi-sign-out"
            severity="danger"
            onClick={handleLogout}
          />
        </Card>
      </div>
    </>
  );
}
