import React from "react";
import { Link } from "react-router-dom";
import "../css/Sidebar.css";
import menuIcon from "../assets/menu.svg";
import preciosIcon from "../assets/precios.svg";
import datosIcon from "../assets/datos.svg";
import buscarIcon from "../assets/buscar.svg";
import convertidorIcon from "../assets/convertidor.svg";
import labelIcon from "../assets/label.svg";

const Sidebar = ({ className = "", onNavigate = () => {} }) => {
  return (
    <aside className={`sidebar ${className}`}>
      <div className="sidebar-header">
        <h1 className="brand-title">Li Safety Pools Covers</h1>
        <h2>v2.5</h2>
        <span className="brand-powered">System</span>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <button type="button" className="sidebar-link" onClick={onNavigate}>
              <img src={menuIcon} alt="Menú" className="sidebar-icon" />
              <span>Menú</span>
            </button>
          </li>
          <li>
            <Link
              to="/dashboard/precios"
              className="sidebar-link"
              onClick={onNavigate}
            >
              <img src={preciosIcon} alt="Precios" className="sidebar-icon" />
              <span>Calculador de Precios</span>
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/database"
              className="sidebar-link"
              onClick={onNavigate}
            >
              <img
                src={datosIcon}
                alt="Base de Datos"
                className="sidebar-icon"
              />
              <span>Base de Datos</span>
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/tabla-precios"
              className="sidebar-link"
              onClick={onNavigate}
            >
              <img
                src={datosIcon}
                alt="Tabla de precios"
                className="sidebar-icon"
              />
              <span>Stock Viewer</span>
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/buscar"
              className="sidebar-link"
              onClick={onNavigate}
            >
              <img src={buscarIcon} alt="Buscar" className="sidebar-icon" />
              <span>Buscar</span>
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/convertidor"
              className="sidebar-link"
              onClick={onNavigate}
            >
              <img
                src={convertidorIcon}
                alt="Convertidor"
                className="sidebar-icon"
              />
              <span>Utilidad Medidas</span>
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/label"
              className="sidebar-link"
              onClick={onNavigate}
            >
              <img src={labelIcon} alt="Label" className="sidebar-icon" />
              <span>Label</span>
            </Link>
          </li>
        </ul>
      </nav>

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
