import { Navigate } from "react-router-dom";
import { isLoggedIn, getAuth } from "../store/authStore";

export default function ProtectedRoute({ children, requireRole }) {
  const loggedIn = isLoggedIn();
  
  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required, check it
  if (requireRole) {
    const auth = getAuth();
    if (auth?.role !== requireRole) {
      // Redirect to appropriate dashboard based on actual role
      if (auth?.role === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (auth?.role === "wisatawan") {
        return <Navigate to="/wisatawan/dashboard" replace />;
      }
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}
