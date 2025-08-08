import React, { useMemo, useState } from "react";
import "../css/PriceCalculator.css";
import { printPage } from "../utils/PrintUtils";
import { calcularPrecio } from "../utils/priceCalculator";
// lógica nueva se conectará después

import { meshStandard, solidStandard } from "./PoolInputs";

const uniq = (arr) => Array.from(new Set(arr));

const useMeshOptions = () => {
  const measures = useMemo(
    () =>
      uniq(meshStandard.flatMap((g) => g.items.map((i) => i.poolSize))).sort(
        (a, b) => a.localeCompare(b, undefined, { numeric: true })
      ),
    []
  );
  const categories = useMemo(
    () =>
      uniq(meshStandard.map((g) => g.group)).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      ),
    []
  );
  return { measures, categories };
};

const useSolidOptions = () => {
  const measures = useMemo(
    () =>
      uniq(solidStandard.flatMap((g) => g.items.map((i) => i.poolSize))).sort(
        (a, b) => a.localeCompare(b, undefined, { numeric: true })
      ),
    []
  );
  const categories = useMemo(
    () =>
      uniq(solidStandard.map((g) => g.group)).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      ),
    []
  );
  return { measures, categories };
};

const PriceCalculator = () => {
  // Cliente
  const [dealer, setDealer] = useState("");
  const [job, setJob] = useState("");
  const [address, setAddress] = useState("");

  // STANDARD – Mesh
  const [meshEnabled, setMeshEnabled] = useState(false);
  const [meshMeasure, setMeshMeasure] = useState("");
  const [meshCategory, setMeshCategory] = useState("");
  const { measures: meshMeasures, categories: meshCategories } =
    useMeshOptions();

  // STANDARD – Solid
  const [solidEnabled, setSolidEnabled] = useState(false);
  const [solidMeasure, setSolidMeasure] = useState("");
  const [solidCategory, setSolidCategory] = useState("");
  const { measures: solidMeasures, categories: solidCategories } =
    useSolidOptions();

  // CUSTOM (card pequeño)
  const [customSqft, setCustomSqft] = useState("");

  // Controles globales (fuera del card de Custom)
  const [padding, setPadding] = useState(""); // lo usaremos en la lógica después
  const [wall, setWall] = useState("");
  const [discount, setDiscount] = useState(""); // %

  // Resultados placeholder
  const [results, setResults] = useState({
    meshRetail: 0,
    meshDealer: 0,
    solidRetail: 0,
    solidDealer: 0,
  });

  const handleCalculate = () => {
    // Determinar el modo
    const mode = customSqft ? "custom" : "standard";

    const result = calcularPrecio({
      meshEnabled,
      meshMeasure,
      meshCategory,
      solidEnabled,
      solidMeasure,
      solidCategory,
      customSqft,
      padding,
      wall,
      discount,
      mode,
    });

    setResults(result);
  };
  const customDisabled = meshEnabled || solidEnabled;

  return (
    <div className="price-calculator">
      {/* Datos de cliente */}
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
            placeholder="Job"
            value={job}
            onChange={(e) => setJob(e.target.value)}
          />
          <input
            type="text"
            placeholder="Ingrese dirección"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      </section>

      {/* Cálculo de precios Standard */}
      <section className="section">
        <h3>Calculo de precios Standard</h3>

        {/* MESH */}
        <div className="row" style={{ alignItems: "center" }}>
          <label
            style={{
              flex: "0 0 100%",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <input
              type="checkbox"
              checked={meshEnabled}
              onChange={() => setMeshEnabled((v) => !v)}
            />
            Mesh
          </label>

          <div className="dropdown">
            <label>Seleccione Medida</label>
            <select
              value={meshMeasure}
              onChange={(e) => setMeshMeasure(e.target.value)}
              disabled={!meshEnabled}
            >
              <option value="">— Seleccione —</option>
              {meshMeasures.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="dropdown">
            <label>Seleccione Tipo de Piscina</label>
            <select
              value={meshCategory}
              onChange={(e) => setMeshCategory(e.target.value)}
              disabled={!meshEnabled}
            >
              <option value="">— Seleccione —</option>
              {meshCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SOLID */}
        <div
          className="row"
          style={{ alignItems: "center", marginTop: "1rem" }}
        >
          <label
            style={{
              flex: "0 0 100%",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <input
              type="checkbox"
              checked={solidEnabled}
              onChange={() => setSolidEnabled((v) => !v)}
            />
            Solid
          </label>

          <div className="dropdown">
            <label>Seleccione Medida</label>
            <select
              value={solidMeasure}
              onChange={(e) => setSolidMeasure(e.target.value)}
              disabled={!solidEnabled}
            >
              <option value="">— Seleccione —</option>
              {solidMeasures.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="dropdown">
            <label>Seleccione Tipo de Piscina</label>
            <select
              value={solidCategory}
              onChange={(e) => setSolidCategory(e.target.value)}
              disabled={!solidEnabled}
            >
              <option value="">— Seleccione —</option>
              {solidCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Custom (card pequeño) + controles globales fuera */}
      <section
        className="section"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
      >
        <div className="section" style={{ margin: 0 }}>
          <h3>Calculo de precios Custom</h3>
          <div className="row">
            <div>
              <label>Pool Size (sqft)</label>
              <input
                type="number"
                placeholder="1500"
                value={customSqft}
                onChange={(e) => setCustomSqft(e.target.value)}
                disabled={customDisabled}
              />
            </div>
          </div>
        </div>

        <div className="row" style={{ alignItems: "end" }}>
          <div>
            <label>Padding</label>
            <input
              type="number"
              placeholder="100"
              value={padding}
              onChange={(e) => setPadding(e.target.value)}
            />
          </div>
          <div>
            <label>Wall</label>
            <input
              type="number"
              placeholder="100"
              value={wall}
              onChange={(e) => setWall(e.target.value)}
            />
          </div>
          <div>
            <label>Descuento</label>
            <input
              type="number"
              placeholder="45"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>
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
          Calcular
        </button>
        <button onClick={printPage} className="btn">
          Imprimir
        </button>
        <button className="btn secondary">Exportar PDF</button>
      </div>
    </div>
  );
};

export default PriceCalculator;
