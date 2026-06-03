import { Router } from "express";
import { db } from "../lib/firestore";
import { authenticate, requireScope } from "../middleware/auth";
import { notFound, serverError } from "../lib/errors";

const router = Router();

// ── GET /integrations ──────────────────────────────────────────────────────────
router.get("/", authenticate, requireScope("integrations:read"), async (req, res) => {
  try {
    const snap = await db.collection("integrations").get();
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ data });
  } catch (err) {
    serverError(res, err);
  }
});

// ── POST /integrations/:id/sync ────────────────────────────────────────────────
router.post("/:id/sync", authenticate, requireScope("integrations:read"), async (req, res) => {
  try {
    const ref = db.collection("integrations").doc(req.params.id);
    const doc = await ref.get();

    if (!doc.exists) {
      notFound(res, `Integración "${req.params.id}" no encontrada.`);
      return;
    }

    const syncId = `sync-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now    = new Date().toISOString();

    // Marca la sincronización como en progreso
    await ref.update({ syncStatus: "queued", lastSyncTriggeredAt: now, lastSyncId: syncId });

    res.json({
      integration:          req.params.id,
      sync_id:              syncId,
      status:               "queued",
      estimated_duration_s: 15,
    });
  } catch (err) {
    serverError(res, err);
  }
});

export default router;
