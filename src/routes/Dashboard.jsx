// src/routes/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../css/Dashboard.css";

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

export default function Dashboard() {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 900);

  // Abierto en desktop, oculto en móvil
  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  // Bloquea el scroll cuando el drawer está abierto en móvil
  useEffect(() => {
    if (isMobile && isSidebarOpen) document.body.classList.add("no-scroll");
    else document.body.classList.remove("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, [isMobile, isSidebarOpen]);

  return (
    <div className={`dashboard-container ${!isSidebarOpen ? "sidebar-hidden" : ""}`}>
      {/* Sidebar: aplica la clase directo al <aside> del componente */}
      <Sidebar
        className={isMobile && isSidebarOpen ? "is-open" : ""}
        onNavigate={() => isMobile && setIsSidebarOpen(false)}  // cierra al navegar
      />

      {/* Overlay para móvil */}
      {isMobile && (
        <div
          className={`backdrop ${isSidebarOpen ? "show" : ""}`}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Área de contenido: aquí se pintan las rutas hijas */}
      <main className="dashboard-main">
        <Outlet />
        <footer className="dashboard-footer">
          TODOS LOS DERECHOS RESERVADOS (R) KIUBO DEVELOPERS
        </footer>
      </main>

      {/* FAB para abrir en móvil */}
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
