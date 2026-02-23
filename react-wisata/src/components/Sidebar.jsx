import { NavLink } from "react-router-dom";

export default function Sidebar({ items, onItemClick }) {
  return (
    <aside className="sidebar surface-100 border-right-1 border-300">
      
      {/* 1. Area Judul */}
      <div className="sidebar-title p-3 text-center font-bold text-lg border-bottom-1 border-300 surface-200">
        SPK Wisata
      </div>

      {/* 2. Area Menu Navigasi */}
      <div className="sidebar-menu">
        {items.map((it) => (
          <NavLink
            key={it.path}
            to={it.path}
            className="flex align-items-center gap-2 p-3 no-underline border-bottom-1 border-300 font-semibold text-sm transition-colors transition-duration-200"
            style={({ isActive }) =>
              isActive
                ? { backgroundColor: "var(--primary-color)", color: "#ffffff" }
                : { color: "#333333" }
            }
            onClick={(e) => onItemClick && onItemClick(it, e)}
          >
            {it.icon && <i className={it.icon}></i>}
            {it.label}
          </NavLink>
        ))}
      </div>

    </aside>
  );
}