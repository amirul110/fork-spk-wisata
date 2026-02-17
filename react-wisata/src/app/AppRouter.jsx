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
import PilihWisata from "../pages/wisatawan/PilihWisata";
import HasilRekomendasi from "../pages/wisatawan/HasilRekomendasi";
import Profile from "../pages/wisatawan/Profile";
import Logout from "../pages/wisatawan/Logout";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requireRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/alternatif" 
          element={
            <ProtectedRoute requireRole="admin">
              <AdminAlternatif />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/kriteria" 
          element={
            <ProtectedRoute requireRole="admin">
              <AdminKriteria />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/sub-kriteria" 
          element={
            <ProtectedRoute requireRole="admin">
              <AdminSubKriteria />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/hasil" 
          element={
            <ProtectedRoute requireRole="admin">
              <AdminHasilRekomendasi />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/profile" 
          element={
            <ProtectedRoute requireRole="admin">
              <AdminProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/logout" 
          element={
            <ProtectedRoute requireRole="admin">
              <AdminLogout />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/wisatawan/dashboard" 
          element={
            <ProtectedRoute requireRole="wisatawan">
              <WisatawanDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/wisatawan/preferensi" 
          element={
            <ProtectedRoute requireRole="wisatawan">
              <PilihWisata />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/wisatawan/hasil" 
          element={
            <ProtectedRoute requireRole="wisatawan">
              <HasilRekomendasi />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/wisatawan/profile" 
          element={
            <ProtectedRoute requireRole="wisatawan">
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/wisatawan/logout" 
          element={
            <ProtectedRoute requireRole="wisatawan">
              <Logout />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
