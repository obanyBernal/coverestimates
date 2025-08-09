// src/layouts/AppLayout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../css/Sidebar.css"; // por si tus estilos viven aquí

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const closeSidebar = () => setIsSidebarOpen(false);
  const openSidebar  = () => setIsSidebarOpen(true);

  return (
    <div className={`app-shell ${isSidebarOpen ? "with-sidebar" : "sidebar-hidden"}`}>
      {isSidebarOpen && <Sidebar onToggle={closeSidebar} />}
      <main className="app-content">
        <Outlet />
      </main>

      {!isSidebarOpen && (
        <button
          className="fab-open"
          onClick={openSidebar}
          aria-label="Abrir menú"
          title="Abrir menú"
        >
          ☰
        </button>
      )}
    </div>
  );
}
