import React, { useMemo, useState, useRef } from "react"; // ⭐ añadí useRef
import "../css/PriceCalculator.css";
import "../css/ExportPDFButton.css";
import { calcularPrecio } from "../utils/priceCalculator";
import { parseAreaExpression } from "../utils/areaParser";
import { meshStandard, solidStandard } from "../components/PoolInputs";
import ExportPDFButton from "../components/ExportPDFButton"; // ⭐ import botón

// 👉 helpers de formato
const fmtNum = (n) =>
  Number.isFinite(+n) ? (+n).toLocaleString("en-US") : "—";
const fmtMoney = (n) =>
  Number.isFinite(+n)
    ? `$${(+n).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "$0.00";

// Para mostrar "expr = valor" si expr existe; si no, solo el valor
const labelExpr = (expr, parsedValue) => {
  if (expr && expr.trim()) {
    return `${expr.replace(/\s+/g, " ")} = ${fmtNum(parsedValue)}`;
  }
  return fmtNum(parsedValue);
};

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

// Genera expresión sumando 2ft a cada dimensión de AxB
const growExpr = (expr, growBy = 2) => {
  if (!expr || !expr.trim()) return { expr: "—", total: 0 };
  const multSep = /\s*[x×*]\s*/i;
  const safeNum = (s) => {
    const n = Number(String(s).trim().replace(",", "."));
    return Number.isFinite(n) ? n : NaN;
  };
  let total = 0;
  let csExpr = expr.trim();
  if (multSep.test(expr)) {
    const [a, b] = expr.split(multSep);
    const n1 = safeNum(a);
    const n2 = safeNum(b);
    if (Number.isFinite(n1) && Number.isFinite(n2)) {
      const r1 = n1 + growBy;
      const r2 = n2 + growBy;
      csExpr = `${r1}x${r2}`;
      total = r1 * r2;
    }
  }
  return { expr: csExpr, total: Math.round(total) };
};

// Reduce 2ft a cada dimensión en términos AxB
const shrinkExpr = (expr, shrinkBy = 2) => {
  if (!expr || !expr.trim()) return { expr: "—", total: 0 };
  const termSep = /\s*\+\s*/;
  const multSep = /\s*[x×*]\s*/i;
  const safeNum = (s) => {
    const n = Number(String(s).trim().replace(",", "."));
    return Number.isFinite(n) ? n : NaN;
  };
  let psTerms = [];
  let total = 0;
  for (const rawTerm of expr.split(termSep).filter(Boolean)) {
    const term = rawTerm.trim();
    if (multSep.test(term)) {
      const [a, b] = term.split(multSep);
      const n1 = safeNum(a);
      const n2 = safeNum(b);
      if (Number.isFinite(n1) && Number.isFinite(n2)) {
        const r1 = Math.max(n1 - shrinkBy, 0);
        const r2 = Math.max(n2 - shrinkBy, 0);
        psTerms.push(`${r1}x${r2}`);
        total += r1 * r2;
      } else {
        psTerms.push(term);
      }
    } else {
      psTerms.push(term);
      const n = safeNum(term);
      if (Number.isFinite(n)) total += n;
    }
  }
  return { expr: psTerms.join(" + "), total: Math.round(total) };
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
  // ⭐ ref del área a exportar
  const pdfRef = useRef(null);

  // Cliente
  const [dealer, setDealer] = useState("");
  const [job, setJob] = useState("");
  //const [address, setAddress] = useState("");

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
  const [customExpr, setCustomExpr] = useState("");
  const [customGrid, setCustomGrid] = useState("5x5");

  const { sqft: parsedSqft, error: exprError } = useMemo(() => {
    const { value, error } = parseAreaExpression(customExpr);
    return { sqft: value, error };
  }, [customExpr]);

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

  const customMeshDisabled = meshEnabled;
  const customSolidDisabled = solidEnabled;

  const toggleGrid = (value) => {
    setCustomGrid((prev) => (prev === value ? "" : value));
  };

  // 🔹 Botón Limpiar
  const handleClear = () => {
    setDealer("");
    setJob("");
    //setAddress("");
    setMeshEnabled(false);
    setMeshMeasure("");
    setMeshCategory("");
    setSolidEnabled(false);
    setSolidMeasure("");
    setSolidCategory("");
    setCustomMeshEnabled(false);
    setCustomSolidEnabled(false);
    setCustomExpr("");
    setCustomGrid("5x5");
    setPadding("");
    setWall("");
    setDiscount("");
    setResults({
      meshRetail: 0,
      meshDealer: 0,
      solidRetail: 0,
      solidDealer: 0,
    });
  };

  // 🚀 handleCalculate
  const handleCalculate = () => {
    const meshMode = customMeshEnabled
      ? "custom"
      : meshEnabled
      ? "standard"
      : "off";
    const solidMode = customSolidEnabled
      ? "custom"
      : solidEnabled
      ? "standard"
      : "off";

    if (meshMode === "off" && solidMode === "off") {
      window.alert(
        "Seleccione al menos una opción en Mesh o Solid (Standard o Custom)."
      );
      return;
    }

    const needsCustomCheck = (mode) => mode === "custom";
    if (needsCustomCheck(meshMode) || needsCustomCheck(solidMode)) {
      if (!customGrid) {
        window.alert("Seleccione el tipo de malla (5x5 o 3x3) para Custom.");
        return;
      }
      if (exprError) {
        window.alert(`Expresión inválida en Custom: ${exprError}`);
        return;
      }
      if (!(parsedSqft > 0)) {
        window.alert("Ingrese un Pool Size (sqft) válido para Custom.");
        return;
      }
    }

    if (meshMode === "standard") {
      if (!meshMeasure || !meshCategory) {
        window.alert(
          "Seleccione Medida y Tipo de Piscina para Mesh (Standard)."
        );
        return;
      }
    }
    if (solidMode === "standard") {
      if (!solidMeasure || !solidCategory) {
        window.alert(
          "Seleccione Medida y Tipo de Piscina para Solid (Standard)."
        );
        return;
      }
    }

    const zero = {
      meshRetail: 0,
      meshDealer: 0,
      solidRetail: 0,
      solidDealer: 0,
    };

    const calcMeshPart = () => {
      if (meshMode === "off") return zero;
      if (meshMode === "standard") {
        return calcularPrecio({
          meshEnabled: true,
          meshMeasure,
          meshCategory,
          solidEnabled: false,
          solidMeasure: "",
          solidCategory: "",
          customMeshEnabled: false,
          customSolidEnabled: false,
          customSqft: 0,
          customGrid,
          padding,
          wall,
          discount,
          mode: "standard",
        });
      } else {
        return calcularPrecio({
          meshEnabled: false,
          meshMeasure: "",
          meshCategory: "",
          solidEnabled: false,
          solidMeasure: "",
          solidCategory: "",
          customMeshEnabled: true,
          customSolidEnabled: false,
          customSqft: parsedSqft,
          customGrid,
          padding,
          wall,
          discount,
          mode: "custom",
        });
      }
    };

    const calcSolidPart = () => {
      if (solidMode === "off") return zero;
      if (solidMode === "standard") {
        return calcularPrecio({
          meshEnabled: false,
          meshMeasure: "",
          meshCategory: "",
          solidEnabled: true,
          solidMeasure,
          solidCategory,
          customMeshEnabled: false,
          customSolidEnabled: false,
          customSqft: 0,
          customGrid,
          padding,
          wall,
          discount,
          mode: "standard",
        });
      } else {
        return calcularPrecio({
          meshEnabled: false,
          meshMeasure: "",
          meshCategory: "",
          solidEnabled: false,
          solidMeasure: "",
          solidCategory: "",
          customMeshEnabled: false,
          customSolidEnabled: true,
          customSqft: parsedSqft,
          customGrid,
          padding,
          wall,
          discount,
          mode: "custom",
        });
      }
    };

    const meshRes = calcMeshPart();
    const solidRes = calcSolidPart();

    setResults({
      meshRetail: meshRes.meshRetail ?? 0,
      meshDealer: meshRes.meshDealer ?? 0,
      solidRetail: solidRes.solidRetail ?? 0,
      solidDealer: solidRes.solidDealer ?? 0,
    });
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
          {/*<input
            type="text"
            placeholder="Ingrese dirección"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />*/}
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

          <div className="row" style={{ alignItems: "center" }}>
            <label
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <input
                type="checkbox"
                checked={customMeshEnabled}
                onChange={() => setCustomMeshEnabled((v) => !v)}
                disabled={customMeshDisabled}
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
                disabled={customSolidDisabled}
              />
              Solid
            </label>
          </div>

          {/* Expresión */}
          <div className="row" style={{ alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div>
                <label>Pool Size (expresión)</label>
                <input
                  type="text"
                  placeholder="Ej: 24x45 + 10x25"
                  value={customExpr}
                  onChange={(e) => setCustomExpr(e.target.value)}
                  disabled={false}
                />
              </div>
              <span className="result-label" style={{ whiteSpace: "nowrap" }}>
                = {Number.isFinite(parsedSqft) ? `${parsedSqft} ft²` : "—"}
              </span>
            </div>
          </div>

          {/* Error/ayuda */}
          <div style={{ minHeight: 20, marginTop: 4 }}>
            {exprError ? (
              <div className="error" style={{ color: "crimson", fontSize: 12 }}>
                {exprError}
              </div>
            ) : (
              <div className="hint" style={{ fontSize: 12, opacity: 0.7 }}>
                Ingresa el valor, puedes ingresar valores ampliados (ej. 20x30 +
                8x10 + 12).
              </div>
            )}
          </div>

          {/* 5x5 / 3x3 */}
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
                disabled={meshEnabled && solidEnabled}
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
                disabled={meshEnabled && solidEnabled}
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
      <section className="section results-card" style={{ background: "#fff" }}>
        <h3>Estimado</h3>
        <div className="res-grid">
          <div className="res-col">
            <div className="res-line">
              <span className="res-key">Dealer:</span>{" "}
              <span className="res-val">{dealer || "—"}</span>
            </div>
            <div className="res-line">
              <span className="res-key">JOB:</span>{" "}
              <span className="res-val">{job || "—"}</span>
            </div>
          </div>
          <div className="res-col">
            <div className="res-pill">{customGrid || "—"}</div>
          </div>
        </div>

        <div className="res-block">
          {(() => {
            const wantsCustom = customMeshEnabled || customSolidEnabled;
            const hasStandardActive = Boolean(
              meshEnabled ||
                solidEnabled ||
                meshMeasure ||
                meshCategory ||
                solidMeasure ||
                solidCategory
            );
            const isCustomMode = wantsCustom && !hasStandardActive;

            let psLabel = "—";
            let csLabel = "—";

            if (isCustomMode) {
              const cs = parsedSqft;
              const { expr: psExpr, total: psTotal } = shrinkExpr(
                customExpr,
                2
              );
              csLabel = labelExpr(customExpr, cs);
              psLabel = `${psExpr} = ${fmtNum(psTotal)}`;
            } else {
              const chosenMeasure = meshMeasure || solidMeasure || "";
              if (chosenMeasure) {
                const psTotal = parseAreaExpression(chosenMeasure).value;
                const { expr: csExpr, total: csTotal } = growExpr(
                  chosenMeasure,
                  2
                );
                psLabel = `${chosenMeasure} = ${fmtNum(psTotal)}`;
                csLabel = `${csExpr} = ${fmtNum(csTotal)}`;
              }
            }

            const wallLabel = fmtNum(wall || 0);
            const paddingLabel = fmtNum(padding || 0);

            return (
              <div className="res-rows">
                <div className="res-line">
                  <span className="res-key">Ps:</span>{" "}
                  <span className="res-val">{psLabel}</span>
                </div>
                <div className="res-line">
                  <span className="res-key">CS:</span>{" "}
                  <span className="res-val">{csLabel}</span>
                </div>
                <div className="res-line">
                  <span className="res-key">Wall:</span>{" "}
                  <span className="res-val">{wallLabel}</span>
                </div>
                <div className="res-line">
                  <span className="res-key">Padding:</span>{" "}
                  <span className="res-val">{paddingLabel}</span>
                </div>
              </div>
            );
          })()}
        </div>

        <div className="res-columns">
          <div className="res-col">
            <div className="res-line">
              <span className="res-key">Mesh Retail:</span>{" "}
              <span className="res-val">{fmtMoney(results.meshRetail)}</span>
            </div>
            <div className="res-line">
              <span className="res-key">Solid Retail:</span>{" "}
              <span className="res-val">{fmtMoney(results.solidRetail)}</span>
            </div>
          </div>
          <div className="res-col">
            <div className="res-line">
              <span className="res-key">Mesh Dealer:</span>{" "}
              <span className="res-val">{fmtMoney(results.meshDealer)}</span>
            </div>
            <div className="res-line">
              <span className="res-key">Solid Dealer:</span>{" "}
              <span className="res-val">{fmtMoney(results.solidDealer)}</span>
            </div>
          </div>
        </div>
      </section>
      {/*  solo pdf */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: "-10000px",
          top: 0,
          width: "720px",
          zIndex: -1,
        }}
      >
        <div ref={pdfRef} className="pdf-sheet">
          <div ref={pdfRef} className="pdf-sheet">
            {/* BLOQUE 1 */}
            <div className="pdf-section pdf-section--primary pdf-section--compact">
              <h3 className="pdf-title pdf-title-lg">Estimado</h3>
              <div className="pdf-grid-2x2 pdf-kv pdf-kv-lg">
                <div className="pdf-k">Dealer:</div>
                <div className="pdf-v">{dealer || "—"}</div>

                <div className="pdf-k">JOB:</div>
                <div className="pdf-v">{job || "—"}</div>

                <div className="pdf-k">Malla:</div>
                <div className="pdf-v">{customGrid || "—"}</div>

                <div className="pdf-k">Fecha / Hora:</div>
                <div className="pdf-v">
                  {new Date().toLocaleDateString()}{" "}
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* BLOQUE 2 */}
            <div className="pdf-section">
              {(() => {
                const wantsCustom = customMeshEnabled || customSolidEnabled;
                const hasStandardActive = Boolean(
                  meshEnabled ||
                    solidEnabled ||
                    meshMeasure ||
                    meshCategory ||
                    solidMeasure ||
                    solidCategory
                );
                const isCustomMode = wantsCustom && !hasStandardActive;

                let psLabel = "—";
                let csLabel = "—";

                if (isCustomMode) {
                  const cs = parsedSqft;
                  const { expr: psExpr, total: psTotal } = shrinkExpr(
                    customExpr,
                    2
                  );
                  csLabel = labelExpr(customExpr, cs);
                  psLabel = `${psExpr} = ${fmtNum(psTotal)}`;
                } else {
                  const chosenMeasure = meshMeasure || solidMeasure || "";
                  if (chosenMeasure) {
                    const psTotal = parseAreaExpression(chosenMeasure).value;
                    const { expr: csExpr, total: csTotal } = growExpr(
                      chosenMeasure,
                      2
                    );
                    psLabel = `${chosenMeasure} = ${fmtNum(psTotal)}`;
                    csLabel = `${csExpr} = ${fmtNum(csTotal)}`;
                  }
                }

                return (
                  <div className="pdf-kv pdf-kv-lg">
                    <div className="pdf-k">Ps:</div>
                    <div className="pdf-v">{psLabel}</div>
                    <div className="pdf-k">CS:</div>
                    <div className="pdf-v">{csLabel}</div>
                    <div className="pdf-k">Wall:</div>
                    <div className="pdf-v">{fmtNum(wall || 0)}</div>
                    <div className="pdf-k">Padding:</div>
                    <div className="pdf-v">{fmtNum(padding || 0)}</div>
                  </div>
                );
              })()}
            </div>

            {/* BLOQUE 3 */}
            <div className="pdf-section">
              <div className="pdf-kv pdf-kv-lg">
                <div className="pdf-k">Mesh Retail:</div>
                <div className="pdf-v">{fmtMoney(results.meshRetail)}</div>
                <div className="pdf-k">Solid Retail:</div>
                <div className="pdf-v">{fmtMoney(results.solidRetail)}</div>
                <div className="pdf-k">Mesh Dealer:</div>
                <div className="pdf-v">{fmtMoney(results.meshDealer)}</div>
                <div className="pdf-k">Solid Dealer:</div>
                <div className="pdf-v">{fmtMoney(results.solidDealer)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="button-row"
        style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}
      >
        <button onClick={handleClear} className="btn">
          Limpiar
        </button>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={handleCalculate} className="btn primary">
            Calcular
          </button>
          <ExportPDFButton
            targetRef={pdfRef}
            filename="detalles_precio.pdf"
            companyLines={[
              "55 Knickerbocker Ave. Bohemia, NY 11716",
              "+1 (631) 704-0010",
              "lisafetypoolcover@gmail.com",
            ]}
            btnLabel="Exportar PDF"
            className="btn secondary"
          />
        </div>
      </div>
    </div>
  );
};

export default PriceCalculator;
