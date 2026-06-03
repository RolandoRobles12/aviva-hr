import "dotenv/config";
import express from "express";
import { db } from "./lib/firestore";
import { authenticate, requireScope } from "./middleware/auth";
import usersRouter from "./routes/users";

const app  = express();
const PORT = process.env.PORT ?? 8080;

app.use(express.json());

// ── Público ────────────────────────────────────────────────────────────────────
app.get("/health", async (_req, res) => {
  try {
    await db.collection("settings").doc("workspace").get();
    res.json({ ok: true, service: "aviva-hr-api", version: "1.0.0", firestore: "connected" });
  } catch {
    res.status(503).json({ ok: false, service: "aviva-hr-api", firestore: "error" });
  }
});

// ── Ping de prueba ─────────────────────────────────────────────────────────────
app.get("/ping", authenticate, requireScope("users:read"), (req, res) => {
  res.json({ ok: true, key: req.apiKey?.name, scopes: req.apiKey?.scopes });
});

// ── Rutas de la API ────────────────────────────────────────────────────────────
app.use("/hr/v1/users", usersRouter);

app.listen(PORT, () => {
  console.log(`Aviva HR API · http://localhost:${PORT}`);
  console.log(`  GET  /hr/v1/users`);
  console.log(`  GET  /hr/v1/users/:id`);
  console.log(`  POST /hr/v1/users`);
  console.log(`  PATCH /hr/v1/users/:id`);
});
