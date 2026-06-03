import "dotenv/config";
import express from "express";
import { db } from "./lib/firestore";
import { authenticate, requireScope } from "./middleware/auth";
import { rateLimit } from "./middleware/rateLimit";
import usersRouter        from "./routes/users";
import ticketsRouter      from "./routes/tickets";
import auditRouter        from "./routes/audit";
import integrationsRouter from "./routes/integrations";

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

// ── Rate limit global (aplica después de autenticar, antes de los handlers) ───
app.use("/hr/v1", rateLimit);

// ── Rutas de la API ────────────────────────────────────────────────────────────
app.use("/hr/v1/users",        usersRouter);
app.use("/hr/v1/tickets",      ticketsRouter);
app.use("/hr/v1/audit",        auditRouter);
app.use("/hr/v1/integrations", integrationsRouter);

app.listen(PORT, () => {
  console.log(`Aviva HR API · http://localhost:${PORT}`);
  console.log(`  GET    /hr/v1/users`);
  console.log(`  GET    /hr/v1/users/:id`);
  console.log(`  POST   /hr/v1/users`);
  console.log(`  PATCH  /hr/v1/users/:id`);
  console.log(`  POST   /hr/v1/users/:id/offboard`);
  console.log(`  GET    /hr/v1/tickets`);
  console.log(`  POST   /hr/v1/tickets/:id/approve`);
  console.log(`  GET    /hr/v1/audit`);
  console.log(`  GET    /hr/v1/integrations`);
  console.log(`  POST   /hr/v1/integrations/:id/sync`);
});
