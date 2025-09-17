// server.js
import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_DIR = path.join(process.cwd(), "data");

// Asegúrate de que exista la carpeta
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

app.use(cors());
app.use(express.json());

// ✅ Guardar cálculo
app.post("/api/prices", (req, res) => {
  const data = req.body;

  if (!data.dealer || !data.job) {
    return res.status(400).json({ error: "Falta dealer o job" });
  }

  const filename = `${data.job || data.dealer}_${new Date()
    .toISOString()
    .slice(0, 10)}.json`;
  const filepath = path.join(DATA_DIR, filename);

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));

  res.json({ ok: true, file: filename });
});

// ✅ Obtener todos los registros
app.get("/api/prices", (req, res) => {
  const files = fs.readdirSync(DATA_DIR);
  const records = files.map((f) => {
    const content = fs.readFileSync(path.join(DATA_DIR, f), "utf-8");
    return JSON.parse(content);
  });
  res.json(records);
});

app.listen(PORT, () =>
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`)
);
