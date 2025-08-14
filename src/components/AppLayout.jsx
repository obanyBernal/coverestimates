// src/layouts/AppLayout.jsx
import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../css/Sidebar.css";
import "../css/Dashboard.css"; // (aquí están .backdrop, .fab-open, .no-scroll)

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 900);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 899.98px)");
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener?.("change", onChange);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return isMobile;
};

export default function AppLayout() {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 900);
  const location = useLocation();

  // Abierto en desktop, cerrado en móvil
  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  // Cerrar automáticamente al cambiar de ruta en móvil
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [isMobile, location.pathname]);

  // Bloquear scroll cuando el drawer está abierto en móvil
  useEffect(() => {
    if (isMobile && isSidebarOpen) document.body.classList.add("no-scroll");
    else document.body.classList.remove("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, [isMobile, isSidebarOpen]);

  return (
    <div className="app-shell">
      <Sidebar
        className={isMobile && isSidebarOpen ? "is-open" : ""}
        onNavigate={() => isMobile && setIsSidebarOpen(false)}
      />

      {isMobile && (
        <div
          className={`backdrop ${isSidebarOpen ? "show" : ""}`}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="app-content">
        <Outlet />
      </main>

      {isMobile && !isSidebarOpen && (
        <button
          className="fab-open"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Abrir menú"
          title="Abrir menú"
        >
          ☰
        </button>
      )}
    </div>
  );
}
