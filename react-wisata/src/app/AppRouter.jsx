import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminAlternatif from "../pages/admin/AdminAlternatif";
import AdminKriteria from "../pages/admin/AdminKriteria";
import AdminSubKriteria from "../pages/admin/AdminSubKriteria";
import AdminHasilRekomendasi from "../pages/admin/AdminHasilRekomendasi";
import AdminProfile from "../pages/admin/AdminProfile";
import AdminLogout from "../pages/admin/AdminLogout";
import WisatawanDashboard from "../pages/wisatawan/WisatawanDashboard";
import PilihKriteria from "../pages/wisatawan/PilihKriteria";
import PilihLokasi from "../pages/wisatawan/PilihLokasi";
import HasilRekomendasi from "../pages/wisatawan/HasilRekomendasi";
import Profile from "../pages/wisatawan/Profile";
import Logout from "../pages/wisatawan/Logout";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../components/DashboardLayout";
import { adminMenu } from "./adminMenu";
import { wisatawanMenu } from "./wisatawanMenu";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireRole="admin">
              <DashboardLayout menu={adminMenu} />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="alternatif" element={<AdminAlternatif />} />
          <Route path="kriteria" element={<AdminKriteria />} />
          <Route path="sub-kriteria" element={<AdminSubKriteria />} />
          <Route path="hasil" element={<AdminHasilRekomendasi />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="logout" element={<AdminLogout />} />
        </Route>

        {/* Wisatawan routes */}
        <Route
          path="/wisatawan"
          element={
            <ProtectedRoute requireRole="wisatawan">
              <DashboardLayout menu={wisatawanMenu} />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<WisatawanDashboard />} />
          <Route path="pilih-kriteria" element={<PilihKriteria />} />
          <Route path="pilih-lokasi" element={<PilihLokasi />} />
          <Route path="hasil" element={<HasilRekomendasi />} />
          <Route path="profile" element={<Profile />} />
          <Route path="logout" element={<Logout />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}