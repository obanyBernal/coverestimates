import React, { useEffect, useState, useRef } from "react";
import ExportPDFButton from "./ExportPDFButton";
import RecordPDFView from "./RecordPDFView";
import "../css/DatabaseViewer.css";

export default function DatabaseViewer() {
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const pdfRef = useRef(null);

const API_URL = import.meta.env.VITE_API_URL;

useEffect(() => {
  fetch(`${API_URL}/api/prices`)
    .then((res) => res.json())
    .then(setRecords)
    .catch((err) => console.error(err));
}, [API_URL]);


  // 🔹 Vista detalle
  if (selectedRecord) {
    return (
      <div className="section">
        <div
          className="detail-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <button
            className="btn secondary"
            onClick={() => setSelectedRecord(null)}
          >
            ⬅ Volver
          </button>
          <ExportPDFButton
            btnLabel="Descargar PDF"
            filename={`${selectedRecord.job || selectedRecord.dealer}_${
              selectedRecord.date
            }.pdf`}
            targetRef={pdfRef}
            className="btn primary"
          />
        </div>

        {/* Aquí renderizamos el mismo layout que el PDF */}
        <div ref={pdfRef} style={{ margin: 0, padding: 0, background: "#fff" }}>
          <RecordPDFView record={selectedRecord} />
        </div>
      </div>
    );
  }

  // 🔹 Vista tabla
  return (
    <div className="section">
      <h3>Registros guardados</h3>
      <div className="table-wrapper">
        <table className="db-table">
          <thead>
            <tr>
              <th>Dealer</th>
              <th>Job</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i}>
                <td>{r.dealer}</td>
                <td>{r.job}</td>
                <td>
                  {r.date
                    ? new Date(r.date).toLocaleDateString() +
                      " " +
                      new Date(r.date).toLocaleTimeString()
                    : "—"}
                </td>
                <td>
                  <button
                    className="btn primary"
                    onClick={() => setSelectedRecord(r)}
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
