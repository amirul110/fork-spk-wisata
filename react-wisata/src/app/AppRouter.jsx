import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminAlternatif from "../pages/admin/AdminAlternatif";
import AdminKriteria from "../pages/admin/AdminKriteria";
import AdminSubKriteria from "../pages/admin/AdminSubKriteria";
import WisatawanDashboard from "../pages/wisatawan/WisatawanDashboard";
import PilihWisata from "../pages/wisatawan/PilihWisata";
import HasilRekomendasi from "../pages/wisatawan/HasilRekomendasi";
import Profile from "../pages/wisatawan/Profile";
import Logout from "../pages/wisatawan/Logout";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/alternatif" element={<AdminAlternatif />} />
        <Route path="/admin/kriteria" element={<AdminKriteria />} />
        <Route path="/admin/sub-kriteria" element={<AdminSubKriteria />} />

        <Route path="/wisatawan/dashboard" element={<WisatawanDashboard />} />
        <Route path="/wisatawan/preferensi" element={<PilihWisata />} />
        <Route path="/wisatawan/hasil" element={<HasilRekomendasi />} />
<Route path="/wisatawan/profile" element={<Profile />} />
<Route path="/wisatawan/logout" element={<Logout />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
