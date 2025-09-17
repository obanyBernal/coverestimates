import React, { forwardRef } from "react";

const RecordPDFView = forwardRef(({ record }, ref) => {
  const fmtMoney = (n) =>
    Number.isFinite(+n)
      ? `$${(+n).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "$0.00";

  return (
    <div ref={ref} className="pdf-sheet" style={{ width: "720px", fontFamily: "Arial" }}>
      {/* BLOQUE 1 */}
      <div className="pdf-section pdf-section--primary pdf-section--compact">
        <h3 className="pdf-title pdf-title-lg">Estimado</h3>
        <div className="pdf-grid-2x2 pdf-kv pdf-kv-lg">
          <div className="pdf-k">Dealer:</div>
          <div className="pdf-v">{record.dealer || "—"}</div>

          <div className="pdf-k">JOB:</div>
          <div className="pdf-v">{record.job || "—"}</div>

          <div className="pdf-k">Malla:</div>
          <div className="pdf-v">{record.customGrid || "—"}</div>

          <div className="pdf-k">Fecha / Hora:</div>
          <div className="pdf-v">
            {record.date
              ? new Date(record.date).toLocaleString()
              : "—"}
          </div>
        </div>
      </div>

      {/* BLOQUE 2 */}
      <div className="pdf-section">
        <div className="pdf-kv pdf-kv-lg">
          <div className="pdf-k">PS:</div>
          <div className="pdf-v">{record.ps || "—"}</div>

          <div className="pdf-k">CS:</div>
          <div className="pdf-v">{record.cs || "—"}</div>

          <div className="pdf-k">Wall:</div>
          <div className="pdf-v">{record.wall || "—"}</div>

          <div className="pdf-k">Padding:</div>
          <div className="pdf-v">{record.padding || "—"}</div>

          <div className="pdf-k">Descuento:</div>
          <div className="pdf-v">{record.discount || "—"}</div>
        </div>
      </div>

      {/* BLOQUE 3 */}
      <div className="pdf-section">
        <div className="pdf-kv pdf-kv-lg">
          <div className="pdf-k">Mesh Retail:</div>
          <div className="pdf-v">{fmtMoney(record.results?.meshRetail)}</div>

          <div className="pdf-k">Solid Retail:</div>
          <div className="pdf-v">{fmtMoney(record.results?.solidRetail)}</div>

          <div className="pdf-k">Mesh Dealer:</div>
          <div className="pdf-v">{fmtMoney(record.results?.meshDealer)}</div>

          <div className="pdf-k">Solid Dealer:</div>
          <div className="pdf-v">{fmtMoney(record.results?.solidDealer)}</div>
        </div>
      </div>
    </div>
  );
});

export default RecordPDFView;
