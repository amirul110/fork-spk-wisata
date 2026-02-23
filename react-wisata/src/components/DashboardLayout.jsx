import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../pages/dashboard.css";

/**
 * DashboardLayout - Shared layout wrapper for all dashboard pages
 * 
 * This component provides the persistent layout structure:
 * - Desktop: Sidebar on left, content on right (CSS Grid columns)
 * - Mobile: Sidebar becomes navbar on top, content below (CSS Grid rows)
 * 
 * The layout uses CSS Grid which automatically handles positioning:
 * - No hardcoded padding or margins needed
 * - Responsive breakpoints in dashboard.css handle desktop vs mobile
 * - Content always positioned correctly without overlap
 */
export default function DashboardLayout({ menu }) {
  return (
    <div className="page">
      <Sidebar items={menu} />
      
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
