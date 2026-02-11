import { NavLink } from "react-router-dom";

export default function Sidebar({ items }) {
  return (
    <aside className="sidebar">
      {items.map((it) => (
        <NavLink
          key={it.path}
          to={it.path}
          className={({ isActive }) => (isActive ? "active" : "")}
          end
        >
          {it.label}
        </NavLink>
      ))}
    </aside>
  );
}
