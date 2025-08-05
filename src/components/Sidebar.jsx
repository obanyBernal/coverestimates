import React from "react";
import "../css/Sidebar.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Prices Calculator</h2>
      <nav className="sidebar-nav">
        <ul>
          <li>📋 Menú</li>
          <li>💲 Precios</li>
          <li>🔢 Tablas de Precios</li>
        </ul>
      </nav>
      <div className="sidebar-user">
        <div className="user-avatar" />
        <p><strong>Admin</strong><br /><span>Usuario Administrador</span></p>
      </div>
    </aside>
  );
};

export default Sidebar;
