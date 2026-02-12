import { NavLink } from "react-router-dom";

export default function Sidebar({ items }) {
  return (
    <aside className="sidebar surface-100 border-right-1 border-300">
      <div className="p-3 text-center font-bold text-lg border-bottom-1 border-300 surface-200">
        SPK Wisata
      </div>
      {items.map((it) => (
        <NavLink
          key={it.path}
          to={it.path}
          className={({ isActive }) =>
            `flex align-items-center gap-2 p-3 no-underline border-bottom-1 border-300 font-semibold text-sm transition-colors transition-duration-200 ${
              isActive
                ? "bg-primary text-white"
                : "text-800 hover:surface-200"
            }`
          }
          end
        >
          {it.icon && <i className={it.icon}></i>}
          {it.label}
        </NavLink>
      ))}
    </aside>
  );
}
