import React from "react";
import Sidebar from "../components/Sidebar";
import PriceCalculator from "../components/PriceCalculator";
import "../css/Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-main">
        <PriceCalculator />
        <footer className="dashboard-footer">
          TODOS LOS DERECHOS RESERVADOS (R) KUBO DEVELOPERS
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
