import React, { useMemo, useState } from "react";
import "../css/PriceCalculator.css";
import { printPage } from "../utils/PrintUtils";
import { calcularPrecio } from "../utils/priceCalculator";

import { meshStandard, solidStandard } from "../components/PoolInputs";

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

  // CUSTOM
  const [customMeshEnabled, setCustomMeshEnabled] = useState(false);
  const [customSolidEnabled, setCustomSolidEnabled] = useState(false);
  const [customSqft, setCustomSqft] = useState("");
  const [customGrid, setCustomGrid] = useState("5x5"); // "5x5" | "3x3"

  // global
  const [padding, setPadding] = useState("");
  const [wall, setWall] = useState("");
  const [discount, setDiscount] = useState("");

  const [results, setResults] = useState({
    meshRetail: 0,
    meshDealer: 0,
    solidRetail: 0,
    solidDealer: 0,
  });

  // 🔒 Standard activo si hay selects llenos
  // ✅ cuenta selects y checkboxes de Standard
  const hasStandardActive = Boolean(
    meshEnabled ||
      solidEnabled ||
      meshMeasure ||
      meshCategory ||
      solidMeasure ||
      solidCategory
  );
  const customDisabled = hasStandardActive;

  // Intención de Custom = al menos un checkbox de Custom
  const wantsCustom = customMeshEnabled || customSolidEnabled;

  const handleCalculate = () => {
    // Si el usuario quiere Custom pero hay algo activo en Standard → conflicto
    if (wantsCustom && hasStandardActive) {
      alert(
        "No puedes calcular Custom mientras haya opciones activas en Standard. Limpia o desmarca la sección Standard."
      );
      return;
    }

    // Si quiere Custom, valida TODO aunque falte sqft (para que avise)
    if (wantsCustom && !hasStandardActive) {
      if (!customMeshEnabled && !customSolidEnabled) {
        alert("Debe seleccionar al menos Mesh o Solid en la sección Custom.");
        return;
      }
      if (!customGrid) {
        alert(
          "Debe seleccionar el tipo de malla (5x5 o 3x3) en la sección Custom."
        );
        return;
      }
      if (!customSqft || Number(customSqft) <= 0) {
        alert("Debe ingresar un valor válido de Pool Size (sqft) para Custom.");
        return;
      }

      // ✅ Modo CUSTOM
      const result = calcularPrecio({
        // standard (se envían igual, pero no afectan el cálculo en modo custom)
        meshEnabled,
        meshMeasure,
        meshCategory,
        solidEnabled,
        solidMeasure,
        solidCategory,

        // custom
        customMeshEnabled,
        customSolidEnabled,
        customSqft,
        customGrid,

        // global
        padding,
        wall,
        discount,

        // modo
        mode: "custom",
      });
      setResults(result);
      return;
    }

    // ✅ Modo STANDARD (no quiere Custom)
    const result = calcularPrecio({
      // standard
      meshEnabled,
      meshMeasure,
      meshCategory,
      solidEnabled,
      solidMeasure,
      solidCategory,

      // custom (se ignoran en modo standard)
      customMeshEnabled,
      customSolidEnabled,
      customSqft,
      customGrid,

      // global
      padding,
      wall,
      discount,

      mode: "standard",
    });
    setResults(result);
  };

  // Checkboxes 5x5/3x3 con comportamiento mutuamente excluyente
  const toggleGrid = (value) => {
    setCustomGrid((prev) => (prev === value ? "" : value));
  };

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

      {/* STANDARD */}
      <section className="section">
        <h3>Calculo de precios Standard</h3>

        {/* Mesh */}
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

        {/* Solid */}
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

      {/* CUSTOM + controles globales */}
      <section
        className="section"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
      >
        {/* Card Custom */}
        <div className="section" style={{ margin: 0 }}>
          <h3>Calculo de precios Custom</h3>

          {/* Checkboxes de Custom: Mesh/Solid separados del Standard */}
          <div className="row" style={{ alignItems: "center" }}>
            <label
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <input
                type="checkbox"
                checked={customMeshEnabled}
                onChange={() => setCustomMeshEnabled((v) => !v)}
                disabled={customDisabled}
              />
              Mesh
            </label>
            <label
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <input
                type="checkbox"
                checked={customSolidEnabled}
                onChange={() => setCustomSolidEnabled((v) => !v)}
                disabled={customDisabled}
              />
              Solid
            </label>
          </div>

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

          {/* Selector 5x5 / 3x3 como checkboxes (mutuamente excluyentes) */}
          <div className="row" style={{ alignItems: "center" }}>
            <label style={{ flex: "0 0 100%", color: "#6e8796" }}>
              Tipo de malla
            </label>

            <label
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <input
                type="checkbox"
                checked={customGrid === "5x5"}
                onChange={() => toggleGrid("5x5")}
                disabled={customDisabled}
              />
              5x5
            </label>

            <label
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <input
                type="checkbox"
                checked={customGrid === "3x3"}
                onChange={() => toggleGrid("3x3")}
                disabled={customDisabled}
              />
              3x3
            </label>
          </div>
        </div>

        {/* Controles globales */}
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
