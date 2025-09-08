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

  const [expresionPies, setExpresionPies] = useState("");
  const resultadoPies = useMemo(() => evalSumaMultip(expresionPies), [expresionPies]);

  return (
    <div className="convertidor-container">
      <h2>Convertidor de Pulgadas a Pies</h2>
      <p className="help">
        Escribe una expresión en <strong>pulgadas</strong> usando <code>+</code> y <code>x</code>.<br />
        Ejemplos: <code>12+3x5</code>, <code>8x4 + 2.5</code>, <code>24+2x6.5</code>
      </p>

      <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
        <div className="row">
          <input
            type="text"
            name="fakeUser"
            style={{ display: "none" }}
            autoComplete="off"
          />
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            name="expresionConvertidor"
            id="expresionConvertidor"
            enterKeyHint="done"
            value={expresion}
            onChange={(e) => setExpresion(e.target.value)}
            placeholder="Ej: 12 + 3x5 + 2.5"
            className="convertidor-input"
            aria-label="Expresión en pulgadas"
          />
        </div>
      </form>

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

          <div className="big-result">
            {Math.round(pies)} ft
            <div className="recommendation">Te recomiendo usar</div>
          </div>
        </div>
      )}

      <hr style={{ margin: "40px 0" }} />

      <h2>Suma de Medidas en Pies</h2>
      <p className="help">
        Escribe varias medidas en pies, incluyendo operaciones.<br />
        Ejemplos: <code>12 + 2.5x4</code>, <code>10 + 6x2</code>
      </p>

      <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
        <div className="row">
          <input
            type="text"
            name="fakeFeetSum"
            style={{ display: "none" }}
            autoComplete="off"
          />
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            name="expresionSumador"
            id="expresionSumador"
            enterKeyHint="done"
            value={expresionPies}
            onChange={(e) => setExpresionPies(e.target.value)}
            placeholder="Ej: 12 + 2.5x4"
            className="convertidor-input"
            aria-label="Suma en pies"
          />
        </div>
      </form>

      {!resultadoPies.ok && expresionPies.trim() !== "" && (
        <div className="alert error">{resultadoPies.error}</div>
      )}

      {resultadoPies.ok && (
        <div className="result">
          <div className="result-line">
            <span>Resultado total:</span>
            <strong>{resultadoPies.value.toFixed(4)} ft</strong>
          </div>

          <div className="big-result">
            {Math.round(resultadoPies.value)} ft
            <div className="recommendation">Te recomiendo usar</div>
          </div>
        </div>
      )}
    </div>
  );
}
