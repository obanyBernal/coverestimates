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
  targetRef,              // ref al contenedor que quieres exportar
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
 // EN ExportPDFButton.jsx, REEMPLAZA LA LLAMADA A html2canvas POR ESTA (MEJOR ESCALA)
const canvas = await html2canvas(targetRef.current, {
  scale: 2,
  backgroundColor: "#ffffff",
  windowWidth: 720,
  useCORS: true,
});

    

    const pdf = new jsPDF("p", "mm", "a4");
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    // Calcular áreas útiles
    const contentWmm = pageW - mm.margin * 2;
    const usableHmm = pageH - mm.headerH - mm.footerH;
  

    // Relación px/mm para cortes por página
    const pxPerMm = canvas.width / contentWmm;
    const pageSlicePx = Math.floor(usableHmm * pxPerMm);

     // Umbral: si el sobrante es menor a X mm, no crear una nueva página
    const MIN_REMAINDER_MM = 3;

    // Prepara logo como DataURL
    const logoDataUrl = await urlToDataURL(logoUrl);

    // Funciones de header/footer
    const drawHeader = () => {
      const logoWmm = 36; // ancho del logo (ajústalo si lo quieres más grande/pequeño)
      const logoHmm = (logoWmm * 1) * 0.33; // altura aprox (relación flexible)
      const x = mm.margin;
      const y = (mm.headerH - logoHmm) / 2; // centrado vertical en header
      try {
        pdf.addImage(logoDataUrl, "PNG", x, y, logoWmm, logoHmm);
      } catch  { /* si falla el logo, no rompemos */ }

      // Línea separadora
      pdf.setLineWidth(0.2);
      pdf.line(mm.margin, mm.headerH, pageW - mm.margin, mm.headerH);
    };

    const drawFooter = (pageNumber) => {
      // Línea separadora
      pdf.setLineWidth(0.2);
      pdf.line(mm.margin, pageH - mm.footerH, pageW - mm.margin, pageH - mm.footerH);

      // Datos de la empresa
      pdf.setFontSize(9);
      const startY = pageH - mm.footerH + 6;
      companyLines.forEach((t, i) => {
        pdf.text(t, pageW / 2, startY + i * 5, { align: "center" });
      });

      // Número de página (opcional)
      pdf.text(String(pageNumber), pageW - mm.margin, pageH - 4, { align: "right" });
    };

    // Iremos cortando el canvas por “rebanadas” de alto pageSlicePx
    let pageIndex = 0;
    const totalHeight = canvas.height;

    while (pageIndex * pageSlicePx < totalHeight) {
      if (pageIndex > 0) pdf.addPage();

      // Crear un canvas temporal para la rebanada
      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = Math.min(pageSlicePx, totalHeight - pageIndex * pageSlicePx);

      const ctx = sliceCanvas.getContext("2d");
      ctx.drawImage(
        canvas,
        0,
        pageIndex * pageSlicePx,         // srcY
        canvas.width,
        sliceCanvas.height,              // srcH (lo que quepa)
        0,
        0,
        sliceCanvas.width,
        sliceCanvas.height
      );

      const sliceImg = sliceCanvas.toDataURL("image/png");

      // Dibuja header/footer
      drawHeader();
      drawFooter(pageIndex + 1);

      // Pegar la rebanada dentro del área útil
      pdf.addImage(
        sliceImg,
        "PNG",
        mm.margin,
        mm.headerH,
        contentWmm,
        (sliceCanvas.height / pxPerMm) // alto en mm de esta rebanada
      );

      pageIndex++;
    }
    
    pdf.save(filename);
  };

  return (
    <button onClick={handleExport} className={className}>
      {btnLabel}
    </button>
  );
}
