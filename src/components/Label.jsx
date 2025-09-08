import React, { useEffect, useMemo, useRef, useState } from "react";
import "../css/Label.css";
// QR sin dependencias pesadas: usa la lib 'qrcode' (canvas→dataURL)
import QRCode from "qrcode";

// Utiles pequeños
const money = (n) =>
  Number.isFinite(+n)
    ? (+n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "0.00";

export default function Label() {
  // FORM STATE
  const [form, setForm] = useState({
    logoText: "L. I. SAFETY POOL COVERS INC.",
    addr1: "55 Knickerbocker Ave. Bohemia, NY 11716",
    phones: "(631) 704 0010",

    orderNumber: "2022 1448",
    invoiceNumber: "1456",
    dueDate: "2022-11-09",

    billTo: "CHRIS POOLS",
    shipTo: "129 Seafield, NY",

    descTitle: "Mesh GRAY 98%",

    // PS (dos renglones como en tu foto)
    ps1Price: 20.33, ps1Qty: 50,
    ps2Price: 0.00,  ps2Qty: -2,

    // CS
    cs1Price: 22.33, cs1Qty: 52,
    cs2Price: 0.00,  cs2Qty: 0,

    // CA (total) se calcula automáticamente, pero puedes sobrescribirlo si quieres
    overrideTotal: "",
    qrUrl: "https://www.lisafetypoolcovers.com"
  });

  const on = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  // CÁLCULO TOTAL
  const calculatedTotal = useMemo(() => {
    const { ps1Price, ps1Qty, ps2Price, ps2Qty, cs1Price, cs1Qty, cs2Price, cs2Qty } = form;
    const toNum = (v) => (v === "" || isNaN(+v) ? 0 : +v);
    const sum =
      toNum(ps1Price) * toNum(ps1Qty) +
      toNum(ps2Price) * toNum(ps2Qty) +
      toNum(cs1Price) * toNum(cs1Qty) +
      toNum(cs2Price) * toNum(cs2Qty);
    return Math.max(0, +sum.toFixed(2));
  }, [form]);

  const total = form.overrideTotal !== "" && !isNaN(+form.overrideTotal)
    ? +(+form.overrideTotal).toFixed(2)
    : calculatedTotal;

  // QR → dataURL
  const [qrDataUrl, setQrDataUrl] = useState("");
  useEffect(() => {
    let mounted = true;
    QRCode.toDataURL(form.qrUrl || "https://www.lisafetypoolcovers.com", { margin: 1, scale: 6 })
      .then((url) => mounted && setQrDataUrl(url))
      .catch(() => mounted && setQrDataUrl(""));
    return () => (mounted = false);
  }, [form.qrUrl]);

  // PRINT SOLO LA ETIQUETA — versión con iframe (evita bloqueadores)
  const printRef = useRef(null);
  const handlePrint = () => {
    const node = printRef.current;
    if (!node) return;

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Print Label</title>
          <style>${printStyles}</style>
        </head>
        <body>${node.outerHTML}</body>
      </html>
    `;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 500);
    }, 50);
  };

  return (
    <div className="label-page">
      <div className="label-form no-print">
        <h2>Crear Label</h2>

        <div className="grid2">
          <label>Order #<input value={form.orderNumber} onChange={on("orderNumber")} /></label>
          <label>Invoice #<input value={form.invoiceNumber} onChange={on("invoiceNumber")} /></label>
          <label>Due Date<input type="date" value={form.dueDate} onChange={on("dueDate")} /></label>
          <label>QR URL<input value={form.qrUrl} onChange={on("qrUrl")} placeholder="https://..." /></label>
        </div>

        <div className="grid2">
          <label>Bill To<textarea rows={2} value={form.billTo} onChange={on("billTo")} /></label>
          <label>Ship To<textarea rows={2} value={form.shipTo} onChange={on("shipTo")} /></label>
        </div>

        <h4>Encabezado</h4>
        <div className="grid1">
          <label>Empresa / Logo (texto) <input value={form.logoText} onChange={on("logoText")} /></label>
          <label>Dirección <input value={form.addr1} onChange={on("addr1")} /></label>
          <label>Teléfonos <input value={form.phones} onChange={on("phones")} /></label>
        </div>

        <h4>Description</h4>
        <label>Título (ej. “Mesh GRAY 98%”) <input value={form.descTitle} onChange={on("descTitle")} /></label>

        <div className="grid4">
          <div className="muted">Linea</div><div className="muted">Precio</div><div className="muted">x</div><div className="muted">Cantidad</div>

          <div>PS</div><input type="number" step="0.01" value={form.ps1Price} onChange={on("ps1Price")} /><div className="x">x</div><input type="number" step="1" value={form.ps1Qty} onChange={on("ps1Qty")} />
          <div>+</div><input type="number" step="0.01" value={form.ps2Price} onChange={on("ps2Price")} /><div className="x">x</div><input type="number" step="1" value={form.ps2Qty} onChange={on("ps2Qty")} />

          <div>CS</div><input type="number" step="0.01" value={form.cs1Price} onChange={on("cs1Price")} /><div className="x">x</div><input type="number" step="1" value={form.cs1Qty} onChange={on("cs1Qty")} />
          <div>+</div><input type="number" step="0.01" value={form.cs2Price} onChange={on("cs2Price")} /><div className="x">x</div><input type="number" step="1" value={form.cs2Qty} onChange={on("cs2Qty")} />
        </div>

        <div className="grid2">
          <label>Total (CA) – opcional override
            <input type="number" step="0.01" value={form.overrideTotal} onChange={on("overrideTotal")} placeholder={`auto: ${money(calculatedTotal)}`} />
          </label>
          <div className="total-preview">
            Total calculado: <b>{money(total)}</b>
          </div>
        </div>

        <div className="actions">
          <button onClick={handlePrint}>Imprimir etiqueta</button>
        </div>
      </div>

      {/* PREVIEW / PRINT AREA */}
      <div className="label-preview-wrap">
        <div className="label-card" ref={printRef}>
          <header className="label-header">
            <div className="logo-box">
              <div className="logo-text">{form.logoText}</div>
              <div className="sub">{form.addr1}</div>
              <div className="sub">{form.phones}</div>
            </div>

            <div className="order-box">
              <div className="right-title">ORDER #</div>
              <div className="order-val">{form.orderNumber}</div>
            </div>
          </header>

          <section className="meta">
            <div><span>ORDER #</span><b className="pink">{form.orderNumber}</b></div>
            <div><span>INVOICE #</span><b>{form.invoiceNumber}</b></div>
            <div><span>Due Date:</span><b>{formatDate(form.dueDate)}</b></div>
          </section>

          <section className="two-cols">
            <div className="col">
              <div className="muted small">Bill to:</div>
              <div className="block">{form.billTo}</div>
            </div>
            <div className="col">
              <div className="muted small">Ship to:</div>
              <div className="block">{form.shipTo}</div>
            </div>
            <div className="qr">
              {qrDataUrl ? <img src={qrDataUrl} alt="QR" /> : <div className="qr-ph">QR</div>}
            </div>
          </section>

          <section className="desc">
            <div className="desc-title">DESCRIPTION:</div>
            <div className="desc-sub">{form.descTitle}</div>

            <table className="price-table">
              <tbody>
                <tr><td className="code">PS</td><td className="val">{money(form.ps1Price)}</td><td className="x">x</td><td className="qty">{money(form.ps1Qty)}</td></tr>
                <tr><td className="code plus">+</td><td className="val">{money(form.ps2Price)}</td><td className="x">x</td><td className="qty">{money(form.ps2Qty)}</td></tr>

                <tr><td className="code">CS</td><td className="val">{money(form.cs1Price)}</td><td className="x">x</td><td className="qty">{money(form.cs1Qty)}</td></tr>
                <tr><td className="code plus">+</td><td className="val">{money(form.cs2Price)}</td><td className="x">x</td><td className="qty">{money(form.cs2Qty)}</td></tr>
              </tbody>
            </table>

            <div className="total">
              <span>CA</span>
              <b>{money(total)}</b>
            </div>
          </section>
        </div>
        <div className="no-print tip">Vista previa (lo resaltado es lo que imprime el botón)</div>
      </div>
    </div>
  );
}

// ===== Helpers & estilos de impresión =====
const formatDate = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso + "T00:00:00");
    const m = d.toLocaleString("en-US", { month: "numeric" });
    const day = d.toLocaleString("en-US", { day: "numeric" });
    const y = d.getFullYear();
    return `${m}/${day}/${y}`;
  } catch {
    return iso;
  }
};

// estilos dedicados para la ventana de impresión (tamaño 4x6 in)
const printStyles = `
  @page { size: 4in 6in; margin: 0.25in; }
  body { font-family: Inter, Arial, sans-serif; align-items: center; height: 100vh;}
  .label-card { width: 100%; border: 1px solid #ddd; padding: 10px; box-sizing: border-box; }
  .label-header { display:flex; justify-content:space-between; gap:10px; }
  .logo-text { font-weight:700; font-size:13px; }
  .sub { font-size:10px; line-height:1.2; }
  .order-box { text-align:right; }
  .right-title { font-size:11px; letter-spacing:.5px; }
  .order-val { color:#e6457a; font-weight:800; font-size:14px; }
  .meta { display:grid; grid-template-columns: repeat(3, 1fr); gap:6px; margin-top:6px; }
  .meta span { font-size:10px; color:#666; margin-right:4px; }
  .meta b { font-size:11px; }
  .pink { color:#e6457a; }
  .two-cols { display:grid; grid-template-columns: 1fr 1fr 80px; gap:8px; align-items:start; margin-top:8px; }
  .block { border:1px solid #eee; padding:6px; min-height:36px; font-size:12px; }
  .qr img { width:78px; height:78px; object-fit:contain; }
  .qr-ph { width:78px; height:78px; display:grid; place-items:center; border:1px dashed #bbb; font-size:12px; color:#999; }
  .desc { margin-top:8px; }
  .desc-title { font-weight:600; font-size:12px; }
  .desc-sub { font-weight:800; font-size:13px; margin:2px 0 6px; }
  .price-table { width: 60%; font-size:12px; }
  .price-table td { padding:2px 6px; }
  .price-table .code { width:22px; }
  .price-table .plus { color:#888; }
  .price-table .val, .price-table .qty { text-align:right; }
  .price-table .x { width:10px; text-align:center; color:#666; }
  .total { display:flex; justify-content:flex-end; align-items:center; gap:10px; margin-top:4px; font-size:13px; }
  .total span { margin-right:12px; }
`;
