import "dotenv/config";
import express from "express";
import { db } from "./lib/firestore";
import { authenticate, requireScope } from "./middleware/auth";

const app  = express();
const PORT = process.env.PORT ?? 8080;

app.use(express.json());

// Público — sin auth
app.get("/health", async (_req, res) => {
  try {
    await db.collection("settings").doc("workspace").get();
    res.json({ ok: true, service: "aviva-hr-api", version: "1.0.0", firestore: "connected" });
  } catch {
    res.status(503).json({ ok: false, service: "aviva-hr-api", firestore: "error" });
  }
});

// Protegido — prueba el middleware antes de tener rutas reales
app.get("/ping", authenticate, requireScope("users:read"), (req, res) => {
  res.json({ ok: true, key: req.apiKey?.name, scopes: req.apiKey?.scopes });
});

app.listen(PORT, () => {
  console.log(`Aviva HR API · http://localhost:${PORT}`);
});
