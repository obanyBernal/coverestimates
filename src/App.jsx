// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./routes/Login";
import Dashboard from "./routes/Dashboard";
import PriceCalculator from "./components/PriceCalculator";
import TablaPrecios from "./components/TablaPrecios"; // ahora desde components
import Buscar from "./components/Buscar";             // ahora desde components
import ConvertidorMedidas from "./components/ConvertidorMedidas";
import Label from "./components/Label";
import DatabaseViewer from "./components/DatabaseViewer";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login en la raíz */}
        <Route path="/" element={<Login />} />

        {/* Layout con sidebar */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Navigate to="precios" replace />} />
          <Route path="database" element={<DatabaseViewer />} />
          <Route path="precios" element={<PriceCalculator />} />
          <Route path="tabla-precios" element={<TablaPrecios />} />
          <Route path="buscar" element={<Buscar />} />
          <Route path="convertidor" element={<ConvertidorMedidas />} />
          <Route path="label" element={<Label />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard/precios" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
