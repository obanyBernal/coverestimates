// src/components/Buscar.jsx
import React, { useMemo, useState } from "react";
import {
  meshStandard,
  solidStandard,
  meshCustom,
  solidCustom,
} from "../components/PoolInputs"; // ✅ tu ruta preferida

const norm = (s) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/['"\s]/g, "");

const isNum = (s) => /^-?\d+(\.\d+)?$/.test(String(s).trim());
const toNum = (s) => Number(String(s).replace(/[^\d.]/g, "") || NaN);

export default function Buscar() {
  const [q, setQ] = useState("");

  // Indexamos (1) catálogo estándar y (2) rangos custom
  const stockRows = useMemo(() => {
    const m = (meshStandard ?? []).flatMap((g) =>
      (g.items ?? []).map((i) => ({
        ...i,
        group: g.group,
        type: "mesh-standard",
      }))
    );
    const s = (solidStandard ?? []).flatMap((g) =>
      (g.items ?? []).map((i) => ({
        ...i,
        group: g.group,
        type: "solid-standard",
      }))
    );
    return [...m, ...s];
  }, []);

  const customRows = useMemo(() => {
    const m = (meshCustom ?? []).map((r) => ({
      ...r,
      type: "mesh-custom",
    }));
    const s = (solidCustom ?? []).map((r) => ({
      ...r,
      type: "solid-custom",
    }));
    return [...m, ...s];
  }, []);

  // Búsqueda
  const { stockHits, customHits } = useMemo(() => {
    const qn = norm(q);

    // Si el usuario teclea un número, intentamos matchear por price/sqft (stock)
    // y por pertenecer a un rango (custom).
    const qIsNum = isNum(q);
    const qAsNum = qIsNum ? toNum(q) : NaN;

    const stockHits = stockRows.filter((row) => {
      const hayTexto =
        qn === "" ||
        norm(row.poolSize).includes(qn) ||
        norm(row.coverSize).includes(qn) ||
        norm(row.group).includes(qn) ||
        norm(row.type).includes(qn);
      const hayNum =
        qIsNum &&
        (toNum(row.price) === qAsNum ||
          toNum(row.sqft) === qAsNum ||
          // también permitimos “empieza con” para precios grandes: 17xx, 2xxx
          String(row.price ?? "").startsWith(String(qAsNum)) ||
          String(row.sqft ?? "").startsWith(String(qAsNum)));

      return hayTexto || hayNum;
    });

    const customHits = customRows.filter((row) => {
      const textoMatch =
        qn === "" ||
        norm(row.type).includes(qn) ||
        (qn.includes("5x5") && true) ||
        (qn.includes("3x3") && true);
      const rangoMatch = qIsNum && qAsNum >= row.min && qAsNum <= row.max;
      return textoMatch || rangoMatch;
    });

    // Limitar para no saturar el UI
    return {
      stockHits: stockHits.slice(0, 100),
      customHits: customHits.slice(0, 50),
    };
  }, [q, stockRows, customRows]);

  return (
    <div className="buscar-wrap" style={{ padding: "12px 16px" }}>
      <h2 style={{ margin: "0 0 12px" }}>Buscar</h2>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Escribe: 16x32, 18x40, mesh, solid, 5x5, 3x3, 2100, 544..."
          className="buscar-input"
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #ddd",
            outline: "none",
          }}
        />
        {q && (
          <button
            onClick={() => setQ("")}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "#f7f7f7",
              cursor: "pointer",
            }}
            aria-label="Limpiar"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Resultados catálogo estándar */}
      <section style={{ marginTop: 18 }}>
        <h3 style={{ margin: "0 0 8px" }}>
          Catálogo estándar{" "}
          <small style={{ color: "#777" }}>({stockHits.length} resultados)</small>
        </h3>
        <div
          style={{
            width: "100%",
            overflow: "auto",
            border: "1px solid #eee",
            borderRadius: 12,
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              minWidth: 720,
            }}
          >
            <thead>
              <tr style={{ background: "#fafafa" }}>
                <Th>Grupo</Th>
                <Th>Tipo</Th>
                <Th>Pool Size</Th>
                <Th>Cover Size</Th>
                <Th align="right">SqFt</Th>
                <Th align="right">Precio</Th>
              </tr>
            </thead>
            <tbody>
              {stockHits.map((r, idx) => (
                <tr key={idx} style={{ borderTop: "1px solid #f0f0f0" }}>
                  <Td>{r.group}</Td>
                  <Td>{r.type}</Td>
                  <Td mono>{r.poolSize}</Td>
                  <Td mono>{r.coverSize}</Td>
                  <Td align="right" mono>
                    {r.sqft}
                  </Td>
                  <Td align="right" mono>
                    ${Number(r.price).toLocaleString("en-US")}
                  </Td>
                </tr>
              ))}
              {stockHits.length === 0 && (
                <tr>
                  <Td colSpan={6} style={{ color: "#999", textAlign: "center" }}>
                    Sin resultados
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Resultados rangos custom */}
      <section style={{ marginTop: 22 }}>
        <h3 style={{ margin: "0 0 8px" }}>
          Precios custom (rangos){" "}
          <small style={{ color: "#777" }}>({customHits.length} resultados)</small>
        </h3>
        <div
          style={{
            width: "100%",
            overflow: "auto",
            border: "1px solid #eee",
            borderRadius: 12,
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              minWidth: 620,
            }}
          >
            <thead>
              <tr style={{ background: "#fafafa" }}>
                <Th>Tipo</Th>
                <Th align="right">Min</Th>
                <Th align="right">Max</Th>
                <Th align="right">$/SqFt 5x5</Th>
                <Th align="right">$/SqFt 3x3</Th>
              </tr>
            </thead>
            <tbody>
              {customHits.map((r, idx) => (
                <tr key={idx} style={{ borderTop: "1px solid #f0f0f0" }}>
                  <Td>{r.type}</Td>
                  <Td align="right" mono>
                    {r.min}
                  </Td>
                  <Td align="right" mono>
                    {r.max}
                  </Td>
                  <Td align="right" mono>
                    ${r.price5x5.toFixed(2)}
                  </Td>
                  <Td align="right" mono>
                    ${r.price3x3.toFixed(2)}
                  </Td>
                </tr>
              ))}
              {customHits.length === 0 && (
                <tr>
                  <Td colSpan={5} style={{ color: "#999", textAlign: "center" }}>
                    Sin resultados
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p style={{ color: "#888", fontSize: 12, marginTop: 8 }}>
          Tip: escribe un número (p.ej. <b>720</b>) para ver filas con ese SqFt o un
          precio que empiece así; o un tamaño como <b>16x32</b>, o palabras como{" "}
          <b>mesh</b>, <b>solid</b>, <b>5x5</b> o <b>3x3</b>.
        </p>
      </section>
    </div>
  );
}

//—— helpers de tabla ——
function Th({ children, align = "left" }) {
  return (
    <th
      style={{
        textAlign: align,
        padding: "10px 12px",
        fontWeight: 600,
        borderBottom: "1px solid #eee",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, align = "left", colSpan, mono = false }) {
  return (
    <td
      colSpan={colSpan}
      style={{
        textAlign: align,
        padding: "10px 12px",
        whiteSpace: "nowrap",
        fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : undefined,
      }}
    >
      {children}
    </td>
  );
}
