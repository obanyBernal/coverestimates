import React from "react";
import "../css/ResultCard.css";

const ResultCard = ({ results }) => {
  return (
    <div className="results-card">
      <p><strong>MESH RETAIL:</strong> ${results.meshRetail.toFixed(2)}</p>
      <p><strong>MESH DEALER:</strong> ${results.meshDealer.toFixed(2)}</p>
      <p><strong>SOLID RETAIL:</strong> ${results.solidRetail.toFixed(2)}</p>
      <p><strong>SOLID DEALER:</strong> ${results.solidDealer.toFixed(2)}</p>
    </div>
  );
};

export default ResultCard;
