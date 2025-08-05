import React, { useState } from "react";
import "../css/PriceCalculator.css";
import { calcularPrecio } from "../utils/priceCalculator";
import { printPage } from "../utils/PrintUtils";

const PriceCalculator = () => {
  const [dealer, setDealer] = useState("");
  const [job, setJob] = useState("");
  const [poolSize, setPoolSize] = useState("");
  const [wall, setWall] = useState("");
  const [discount, setDiscount] = useState("");
  const [poolType, setPoolType] = useState(""); // ej: Mesh 5x5 Standard

  // Placeholder para resultados
  const [results, setResults] = useState({
    meshRetail: 0,
    solidRetail: 0,
    meshDealer: 0,
    solidDealer: 0,
  });

  const handleCalculate = () => {
    const result = calcularPrecio(poolSize, wall, discount, poolType);
    if (result) {
      setResults(result);
    } else {
      alert("Error en formato de Pool Size");
    }
  };

  return (
    <div className="price-calculator">
      {/* Datos de Cliente */}
      <section className="section">
        <h3>Datos de cliente</h3>
        <div className="row">
          <input
            type="text"
            placeholder="Ingrese el nombre del dealer"
            value={dealer}
            onChange={(e) => setDealer(e.target.value)}
          />
          <input
            type="text"
            placeholder="Ingrese dirección o job"
            value={job}
            onChange={(e) => setJob(e.target.value)}
          />
        </div>
      </section>

      {/* Cálculo de Precios */}
      <section className="section">
        <h3>Calculo de precios</h3>
        <div className="row">
          <input
            type="text"
            placeholder="45x15"
            value={poolSize}
            onChange={(e) => setPoolSize(e.target.value)}
          />
          <input
            type="number"
            placeholder="Wall (pies)"
            value={wall}
            onChange={(e) => setWall(e.target.value)}
          />
          <input
            type="number"
            placeholder="45%"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          />
        </div>
        <div className="dropdown">
          <label>Seleccione el tipo de piscina:</label>
          <select
            value={poolType}
            onChange={(e) => setPoolType(e.target.value)}
          >
            <option value="">-- Seleccione --</option>
            <option value="mesh-5x5-standard">Mesh 5x5 Standard</option>
            <option value="mesh-5x5-custom">Mesh 5x5 Custom</option>
            <option value="mesh-3x3-standard">Mesh 3x3 Standard</option>
            <option value="mesh-3x3-custom">Mesh 3x3 Custom</option>
            <option value="solid-5x5-standard">Solid 5x5 Standard</option>
            <option value="solid-5x5-custom">Solid 5x5 Custom</option>
            <option value="solid-3x3-standard">Solid 3x3 Standard</option>
            <option value="solid-3x3-custom">Solid 3x3 Custom</option>
          </select>
        </div>
      </section>

      {/* Resultados */}
      <section className="section results">
        <h3>Resultados</h3>
        <div className="row results-row">
          <p>
            <strong>MESH RETAIL:</strong> ${results.meshRetail.toFixed(2)}
          </p>
          <p>
            <strong>MESH DEALER:</strong> ${results.meshDealer.toFixed(2)}
          </p>
        </div>
        <div className="row results-row">
          <p>
            <strong>SOLID RETAIL:</strong> ${results.solidRetail.toFixed(2)}
          </p>
          <p>
            <strong>SOLID DEALER:</strong> ${results.solidDealer.toFixed(2)}
          </p>
        </div>
      </section>

      {/* Botones */}
      <div className="button-row">
        <button onClick={handleCalculate} className="btn primary">
          CALCULAR
        </button>
        <button onClick={printPage} className="btn">
          IMPRIMIR
        </button>
        <button className="btn secondary">EXPORTAR PDF</button>
      </div>
    </div>
  );
};

export default PriceCalculator;
