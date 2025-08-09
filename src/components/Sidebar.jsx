import React from "react";
import { Link } from "react-router-dom";
import "../css/Sidebar.css";
import menuIcon from "../assets/menu.svg";
import preciosIcon from "../assets/precios.svg";
import datosIcon from "../assets/datos.svg";
import buscarIcon from "../assets/buscar.svg";

const Sidebar = ({ onToggle = () => {} }) => {
  return (
    <aside className="sidebar">
      {/* HEADER */}
      <div className="sidebar-header">
        <h1 className="brand-title">Prices Calculator</h1>
        <span className="brand-powered">Powered by OBernal</span>
      </div>

      {/* NAV */}
      <nav className="sidebar-nav">
        <ul>
          <li>
            <button type="button" className="sidebar-link" onClick={onToggle}>
              <img src={menuIcon} alt="Menú" className="sidebar-icon" />
              <span>Menú</span>
            </button>
          </li>
          <li>
            <Link to="/dashboard/precios" className="sidebar-link">
              <img src={preciosIcon} alt="Precios" className="sidebar-icon" />
              <span>Precios</span>
            </Link>
          </li>
          <li>
            <Link to="/dashboard/tabla-precios" className="sidebar-link">
              <img src={datosIcon} alt="Tabla de precios" className="sidebar-icon" />
              <span>Tablas de Precios</span>
            </Link>
          </li>
          <li>
            <Link to="/dashboard/buscar" className="sidebar-link">
              <img src={buscarIcon} alt="Buscar" className="sidebar-icon" />
              <span>Buscar</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* FOOTER / USER */}
      <div className="sidebar-footer">
        <div className="user-avatar" />
        <div className="user-info">
          <div className="user-name">Admin</div>
          <div className="user-role">Usuario Administrador</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
