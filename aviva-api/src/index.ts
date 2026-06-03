import "dotenv/config";
import express from "express";
import { db } from "./lib/firestore";

const app  = express();
const PORT = process.env.PORT ?? 8080;

app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    // Verifica la conexión a Firestore con una lectura mínima
    await db.collection("settings").doc("workspace").get();
    res.json({
      ok:        true,
      service:   "aviva-hr-api",
      version:   "1.0.0",
      firestore: "connected",
    });
  } catch {
    res.status(503).json({
      ok:        false,
      service:   "aviva-hr-api",
      firestore: "error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Aviva HR API · http://localhost:${PORT}`);
});
