import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../css/Dashboard.css";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className={`dashboard-container ${isSidebarOpen ? "" : "sidebar-hidden"}`}>
      {isSidebarOpen && <Sidebar onToggle={() => setIsSidebarOpen(false)} />}

      <main className="dashboard-main">
        {/* Aquí se carga la ruta hija */}
        <Outlet />
        
        <footer className="dashboard-footer">
          TODOS LOS DERECHOS RESERVADOS (R) KUBO DEVELOPERS
        </footer>
      </main>

      {!isSidebarOpen && (
        <button
          className="fab-open"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Abrir menú"
        >
          ☰
        </button>
      )}
    </div>
  );
};

export default Dashboard;
