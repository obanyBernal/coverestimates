// src/components/ExportPDFButton.jsx
import React from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logoUrl from "../assets/logo.png"; // ← tu logo

const mm = {
  pageW: 210, // A4
  pageH: 297,
  margin: 10,
  headerH: 22,
  footerH: 24,
};

async function urlToDataURL(url) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

export default function ExportPDFButton({
  targetRef, // ref al contenedor que quieres exportar
  filename = "detalles_precio.pdf",
  companyLines = [
    "55 Knickerbocker Ave. Bohemia, NY 11716",
    "+1 (631) 704-0010",
    "lisafetypoolcover@gmail.com",
  ],
  btnLabel = "Exportar a PDF",
  className = "",
}) {
  const handleExport = async () => {
    if (!targetRef?.current) return;

    // Render del contenido a canvas
    const canvas = await html2canvas(targetRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
      windowWidth: 720,
      useCORS: true,
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    const contentWmm = pageW - mm.margin * 2;
    const usableHmm = pageH - mm.headerH - mm.footerH;

    // Prepara logo como DataURL
    const logoDataUrl = await urlToDataURL(logoUrl);

    // Header
    const drawHeader = () => {
      const logoWmm = 36;
      const logoHmm = logoWmm * 0.33;
      const x = mm.margin;
      const y = (mm.headerH - logoHmm) / 2;
      try {
        pdf.addImage(logoDataUrl, "PNG", x, y, logoWmm, logoHmm);
      } catch {
        /* si falla el logo, no rompemos */
      }
      pdf.setLineWidth(0.2);
      pdf.line(mm.margin, mm.headerH, pageW - mm.margin, mm.headerH);
    };

    // Footer
    const drawFooter = () => {
      pdf.setLineWidth(0.2);
      pdf.line(
        mm.margin,
        pageH - mm.footerH,
        pageW - mm.margin,
        pageH - mm.footerH
      );
      pdf.setFontSize(9);
      const startY = pageH - mm.footerH + 6;
      companyLines.forEach((t, i) => {
        pdf.text(t, pageW / 2, startY + i * 5, { align: "center" });
      });
      pdf.text("1", pageW - mm.margin, pageH - 4, { align: "right" });
    };

    // Convertimos todo el canvas en una sola imagen
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", mm.margin, mm.headerH, contentWmm, usableHmm);

    drawHeader();
    drawFooter();

    pdf.save(filename);
  };

  return (
    <button onClick={handleExport} className={className}>
      {btnLabel}
    </button>
  );
}
