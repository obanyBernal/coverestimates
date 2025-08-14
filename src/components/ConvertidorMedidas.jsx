import React, { useMemo, useState } from "react";
import "../css/ConvertidorMedidas.css";

/**
 * Evalúa una expresión con + y * (y decimales).
 * Precedencia: * antes que +. No usa eval.
 * Devuelve { ok: true, value } o { ok: false, error }.
 */
function evalSumaMultip(exprRaw) {
  // Reemplaza 'x' o 'X' por '*'
  const expr = String(exprRaw ?? "").trim().replace(/x/gi, "*");

  // Validación básica: solo dígitos, punto decimal, +, *, espacios
  if (!/^[\d.+*\s]+$/.test(expr) || expr === "") {
    return { ok: false, error: "Solo se permiten números, +, *, o x" };
  }

  // Evitar operadores repetidos o mal posicionados
  if (/[+*]{2,}/.test(expr) || /^[+*]/.test(expr) || /[+*]$/.test(expr)) {
    return { ok: false, error: "Expresión inválida" };
  }

  // Sumar términos separados por +
  let total = 0;
  for (const term of expr.split("+")) {
    const t = term.trim();
    if (t === "") return { ok: false, error: "Expresión inválida" };

    // Producto de factores separados por *
    let prod = 1;
    for (const factor of t.split("*")) {
      const f = factor.trim();
      if (f === "" || f === ".") return { ok: false, error: "Número inválido" };
      const n = Number(f);
      if (!Number.isFinite(n)) return { ok: false, error: "Número inválido" };
      prod *= n;
    }
    total += prod;
  }

  return { ok: true, value: total };
}


export default function ConvertidorMedidas() {
  const [expresion, setExpresion] = useState("");
  const resultado = useMemo(() => evalSumaMultip(expresion), [expresion]);

  const pulgadas = resultado.ok ? resultado.value : null;
  const pies = resultado.ok ? pulgadas / 12 : null;

  return (
    <div className="convertidor-container">
      <h2>Convertidor de Pulgadas a Pies</h2>
      <p className="help">
        Escribe una expresión en <strong>pulgadas</strong> usando <code>+</code>{" "}
        y <code>x</code>.
        <br />
        Ejemplos: <code>12+3x5</code>, <code>8x4 + 2.5</code>,{" "}
        <code>24+2x6.5</code>
      </p>

      <div className="row">
        <input
          type="text"
          inputMode="decimal"
          value={expresion}
          onChange={(e) => setExpresion(e.target.value)}
          placeholder="Ej: 12 + 3x5 + 2.5"
          className="convertidor-input"
          aria-label="Expresión en pulgadas"
        />
      </div>

      {!resultado.ok && expresion.trim() !== "" && (
        <div className="alert error">{resultado.error}</div>
      )}

      {resultado.ok && (
        <div className="result">
          <div className="result-line">
            <span>Pulgadas totales:</span>
            <strong>{pulgadas.toFixed(4)} in</strong>
          </div>
          <div className="result-line">
            <span>Equivalente en pies:</span>
            <strong>{pies.toFixed(4)} ft</strong>
          </div>

          {/* Número grande y recomendación */}
          {/* Número grande (solo el entero recomendado) y leyenda */}
          <div className="big-result">
            {Math.round(pies)} ft
            <div className="recommendation">Te recomiendo usar</div>
          </div>
        </div>
      )}
    </div>
  );
}
